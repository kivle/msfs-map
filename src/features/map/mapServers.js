import L from 'leaflet';
import 'leaflet-providers';
import { providerRequiresApiKey, resolveAttribution } from './mapProviderUtils';
import vectorMaps from './mapVectorStyles';

function buildProviderVariant(providerName, variantName, providers) {
  const providerDefinition = providers[providerName];

  if (!providerDefinition || providerRequiresApiKey(providerName, providerDefinition)) {
    return undefined;
  }

  let url = providerDefinition.url;
  let options = { ...(providerDefinition.options ?? {}) };
  let resolvedVariant = options.variant;
  const id = variantName ? `${providerName}.${variantName}` : providerName;

  if (variantName) {
    const variant = providerDefinition.variants?.[variantName];
    const variantOptions = typeof variant === 'string' ? { variant } : (variant?.options ?? {});
    url = (typeof variant === 'object' && variant?.url) ? variant.url : url;
    options = { ...options, ...variantOptions };
    resolvedVariant = variantOptions.variant ?? resolvedVariant ?? variantName;
  }

  if (url.includes('{variant}') && resolvedVariant) {
    url = url.replace('{variant}', resolvedVariant);
  } else if (url.includes('{variant}')) {
    // Skip providers whose URL templates require a variant we don't know.
    return undefined;
  }

  const attribution = resolveAttribution(options.attribution, providers);
  const { attribution: _, variant, ...tileOptions } = options;

  return {
    id,
    name: `raster: ${variantName ? `${providerName} - ${variantName}` : providerName}`,
    type: 'tileServer',
    renderType: 'raster',
    tileServer: url,
    attribution,
    tileOptions
  };
}

function buildFreeProviders(providers) {
  const entries = Object.keys(providers).flatMap((providerName) => {
    const providerDefinition = providers[providerName];
    if (providerRequiresApiKey(providerName, providerDefinition)) return [];

    const variants = providerDefinition.variants ? Object.keys(providerDefinition.variants) : [];
    const providerEntries = [
      buildProviderVariant(providerName, undefined, providers),
      ...variants.map((variantName) => buildProviderVariant(providerName, variantName, providers))
    ];

    return providerEntries.filter(Boolean);
  });

  return entries;
}

const providers = L.TileLayer?.Provider?.providers ?? {};
const servers = buildFreeProviders(providers);

const openStreetMap = servers.find((s) => s.id === 'OpenStreetMap');
if (!openStreetMap) {
  servers.unshift({
    id: 'OpenStreetMap',
    name: 'raster: OpenStreetMap',
    type: 'tileServer',
    renderType: 'raster',
    tileServer: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileOptions: { maxZoom: 19 }
  });
} else {
  servers.sort((a, b) => (a.id === 'OpenStreetMap' ? -1 : b.id === 'OpenStreetMap' ? 1 : 0));
}

const allMaps = [...servers, ...vectorMaps];

const uniqueMaps = [];
const seen = new Set();
for (const m of allMaps) {
  if (seen.has(m.id)) continue;
  if (m.tileServer && m.tileServer.includes('{variant}')) continue;
  seen.add(m.id);
  uniqueMaps.push(m);
}

uniqueMaps.sort((a, b) => (a.id === 'OpenStreetMap' ? -1 : b.id === 'OpenStreetMap' ? 1 : 0));

export default uniqueMaps;
