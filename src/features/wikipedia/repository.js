import localforage from 'localforage';
import { getDistance } from 'geolib';
import api from './api';

const CACHE_INDEX_KEY = 'wikipedia-page-index';
const CACHE_ENTRY_PREFIX = 'wikipedia-page-';
const MAX_CACHE_ENTRIES = 200;

function stripHtml(value) {
  if (!value) return undefined;
  const raw = typeof value === 'string'
    ? value
    : Array.isArray(value)
      ? value.join(' ')
      : (value?.value ?? undefined);
  if (typeof raw !== 'string') return undefined;
  return raw.replace(/<[^>]*>/g, '');
}

function isPhoto(info) {
  const mime = info?.mime ?? '';
  const mediatype = info?.mediatype ?? '';
  const isBitmap = mediatype?.toLowerCase?.() === 'bitmap';
  const isImage = mime.toLowerCase().startsWith('image/');
  const isSvg = mime.toLowerCase().includes('svg');
  return (isBitmap || isImage) && !isSvg;
}

function isSvgLike(value) {
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower.includes('.svg');
}

function boundsCenter(bbox) {
  if (!bbox) return undefined;
  const { north, east, south, west } = bbox;
  return {
    latitude: (north + south) / 2,
    longitude: (east + west) / 2
  };
}

async function loadCacheIndex() {
  try {
    return (await localforage.getItem(CACHE_INDEX_KEY)) ?? {};
  } catch {
    return {};
  }
}

async function saveCacheIndex(index) {
  try {
    await localforage.setItem(CACHE_INDEX_KEY, index);
  } catch {
    // ignore persistence errors
  }
}

async function updateIndexEntry(cacheId, meta) {
  const index = await loadCacheIndex();
  index[cacheId] = {
    ...(index[cacheId] ?? {}),
    ...meta,
    lastAccessed: new Date().getTime()
  };
  await saveCacheIndex(index);
  return index;
}

async function evictIfNeeded(index, bbox) {
  const ids = Object.keys(index ?? {});
  if (ids.length <= MAX_CACHE_ENTRIES) return index;

  const center = boundsCenter(bbox);
  const scored = ids.map((id) => {
    const meta = index[id] ?? {};
    const distance = center && meta?.lat !== undefined && meta?.lon !== undefined
      ? getDistance(center, { latitude: meta.lat, longitude: meta.lon })
      : Number.MAX_SAFE_INTEGER;
    const recency = meta?.lastAccessed ?? 0;
    return {
      id,
      score: distance + Math.max(0, new Date().getTime() - recency) / 1000
    };
  }).sort((a, b) => b.score - a.score);

  const toRemove = scored.slice(0, ids.length - MAX_CACHE_ENTRIES);
  await Promise.all(toRemove.map(({ id }) => localforage.removeItem(`${CACHE_ENTRY_PREFIX}${id}`)));
  toRemove.forEach(({ id }) => delete index[id]);
  await saveCacheIndex(index);
  return index;
}

function cacheKey(pageid, edition) {
  return `${CACHE_ENTRY_PREFIX}${edition}-${pageid}`;
}

function normalizeGallery(page) {
  const gallery = Array.isArray(page?.pageimages) ? [...page.pageimages] : [];
  page.pageimages = gallery;
  return page;
}

async function cachePageDetail(pageid, page, edition, bbox) {
  const coords = page?.coordinates?.[0];
  const lat = coords?.lat ?? coords?.latitude;
  const lon = coords?.lon ?? coords?.lng ?? coords?.longitude;
  const key = cacheKey(pageid, edition);
  const index = await updateIndexEntry(key, { lat, lon });
  await localforage.setItem(key, page);
  await evictIfNeeded(index, bbox);
  return page;
}

async function readCachedPage(pageid, edition) {
  try {
    const cached = await localforage.getItem(cacheKey(pageid, edition));
    if (!cached) return undefined;
    await updateIndexEntry(cacheKey(pageid, edition), {});
    return cached;
  } catch {
    return undefined;
  }
}

class WikipediaRepository {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async getPagesByBoundingBox(edition, bbox, limit = 50) {
    const data = await this.api.searchByBoundingBox(edition, bbox, limit);
    return data?.query?.geosearch ?? [];
  }

  async getPageDetailsByIds(edition, pageids, bbox, includeImages = true) {
    const cached = await Promise.all(
      (pageids ?? []).map(async (id) => ({
        id,
        page: await readCachedPage(id, edition)
      }))
    );

    const missing = cached.filter(({ page }) => !page).map(({ id }) => id);
    let fetchedPages = {};

    if (missing.length) {
      const data = await this.api.getPagesByIds(edition, missing);
      fetchedPages = data?.query?.pages ?? {};
      if (!includeImages) {
        return fetchedPages;
      }
      const imageTitles = Object.values(fetchedPages)
        .flatMap((page) => (page?.images ?? [])
          .map((img) => img?.title)
          .filter((t) => t?.startsWith?.('File:')))
        .slice(0, 30);

      let imageInfoByTitle = {};
      if (imageTitles.length) {
        const imageInfo = await this.api.getImagesInfo(edition, imageTitles);
        const pagesInfo = imageInfo?.query?.pages ?? {};
        imageInfoByTitle = Object.values(pagesInfo).reduce((acc, imgPage) => {
          const info = imgPage?.imageinfo?.[0];
          const filename = imgPage.title?.replace(/^File:/i, '');
          const isSvgOrThumbSvg = isSvgLike(filename) || isSvgLike(info?.thumburl) || isSvgLike(info?.url);
          if (!isSvgOrThumbSvg && info && isPhoto(info) && (info.thumburl || info.url)) {
            const desc = info?.extmetadata?.ImageDescription?.value || info?.extmetadata?.ObjectName?.value;
            acc[imgPage.title] = {
              source: info.thumburl ?? info.url,
              caption: desc ? stripHtml(desc) : undefined,
              filename
            };
          }
          return acc;
        }, {});
      }

      Object.values(fetchedPages).forEach((page) => {
        const gallery = (page?.images ?? [])
          .map((img) => imageInfoByTitle[img?.title])
          .filter(Boolean);

        // If we have an existing cached gallery (from a fast-first fetch), preserve it when the filtered gallery is empty.
        if (!gallery.length && page.pageimages?.length) {
          page.pageimages = page.pageimages;
        }

        if (gallery.length) {
          page.pageimages = gallery;
        } else if (page?.thumbnail?.source && !isSvgLike(page.thumbnail.source)) {
          page.pageimages = [{ source: page.thumbnail.source }];
        }
        normalizeGallery(page);
      });

      await Promise.all(
        Object.values(fetchedPages).map((page) =>
          cachePageDetail(page.pageid, page, edition, bbox)
        )
      );
    }

    const allPages = cached.reduce((acc, { id, page }) => {
      if (page) acc[id] = normalizeGallery({ ...page });
      return acc;
    }, { ...fetchedPages });

    return allPages;
  }
}

const instance = new WikipediaRepository(api);

export default instance;
