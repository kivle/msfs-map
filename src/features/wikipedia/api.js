class WikipediaApi {
  getWikipediaApiUrl(edition, queryParams) {
    const query = Object.keys(queryParams).reduce(
      (aggr, key) => {
        if (aggr) aggr += '&';
        return `${aggr}${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`;
      }, ''
    );

    return `https://${edition}.wikipedia.org/w/api.php?${query}`;
  }

  async searchByBoundingBox(edition, bbox, limit = 50) {
    const { north, east, south, west } = bbox ?? {};
    const query = {
      format: 'json',
      action: 'query',
      list: 'geosearch',
      // gsbbox expects top|left|bottom|right (north|west|south|east)
      gsbbox: `${north}|${west}|${south}|${east}`,
      gslimit: limit,
      origin: '*',
      gsprop: 'type|name|dim|country|region|globe'
    };

    const url = this.getWikipediaApiUrl(edition, query);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Wikipedia geosearch failed: ${resp.status}`);
    return await resp.json();
  }

  async getPagesByIds(edition, pageids) {
    if (!pageids?.length) return null;
    const query = {
      format: 'json',
      action: 'query',
      origin: '*',
      prop: 'extracts|pageimages|coordinates|info|images',
      pageids: pageids.join('|'),
      exlimit: pageids.length,
      pithumbsize: '400',
      inprop: 'url'
    };

    const url = this.getWikipediaApiUrl(edition, query);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Wikipedia page fetch failed: ${resp.status}`);
    return await resp.json();
  }

  async getImagesInfo(edition, titles = []) {
    if (!titles.length) return null;
    const query = {
      format: 'json',
      action: 'query',
      origin: '*',
      titles: titles.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|mime|mediatype|extmetadata',
      iiextmetadatafilter: 'ImageDescription|ObjectName',
      iiextmetadatalanguage: 'en',
      iiextmetadatamultilang: 1,
      iiurlwidth: 800,
      iiurlheight: 800
    };

    const url = this.getWikipediaApiUrl(edition, query);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Wikipedia imageinfo failed: ${resp.status}`);
    return await resp.json();
  }
}

const instance = new WikipediaApi();

export default instance;
