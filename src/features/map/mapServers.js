import L from 'leaflet';
import 'leaflet-providers';

const KEY_PLACEHOLDER_STRINGS = [
  '{apikey}',
  '{apiKey}',
  '{accessToken}',
  '{subscriptionKey}',
  '{key}',
  '{app_id}',
  '{app_code}',
  '{token}'
];

const KEY_OPTION_FIELDS = [
  'apikey',
  'apiKey',
  'accessToken',
  'subscriptionKey',
  'key',
  'app_id',
  'app_code',
  'token'
];

function isHttpsUrl(url) {
  return typeof url === 'string' && url.startsWith('https://');
}

function hasKeyPlaceholder(value) {
  return typeof value === 'string' && KEY_PLACEHOLDER_STRINGS.some((placeholder) => value.includes(placeholder));
}

function optionsContainKeys(options = {}) {
  return Object.entries(options).some(([key, value]) => KEY_OPTION_FIELDS.includes(key) || hasKeyPlaceholder(value));
}

function providerRequiresApiKey(providerName, providerDefinition) {
  if (!providerDefinition) return true;

  const urls = [providerDefinition.url];
  if (providerDefinition.variants) {
    Object.values(providerDefinition.variants).forEach((variant) => {
      if (typeof variant === 'string') return;
      if (variant?.url) urls.push(variant.url);
    });
  }

  if (urls.some((u) => hasKeyPlaceholder(u) || !isHttpsUrl(u))) return true;
  if (optionsContainKeys(providerDefinition.options)) return true;

  if (providerDefinition.variants) {
    const variantOptions = Object.values(providerDefinition.variants)
      .filter((v) => typeof v !== 'string')
      .map((variant) => variant?.options ?? {});
    if (variantOptions.some(optionsContainKeys)) return true;

    const variantUrls = Object.values(providerDefinition.variants)
      .filter((v) => typeof v === 'object' && v?.url)
      .map((variant) => variant.url);
    if (variantUrls.some((u) => hasKeyPlaceholder(u) || !isHttpsUrl(u))) return true;
  }

  return false;
}

function resolveAttribution(attribution, providers) {
  if (!attribution || attribution.indexOf('{attribution.') === -1) return attribution;

  return attribution.replace(/\{attribution.(\w*)\}/g, (match, providerName) => {
    return resolveAttribution(providers[providerName].options.attribution, providers);
  });
}

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
  }

  const attribution = resolveAttribution(options.attribution, providers);
  const { attribution: _, variant, ...tileOptions } = options;

  return {
    id,
    name: variantName ? `${providerName} - ${variantName}` : providerName,
    type: 'tileServer',
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

const openStreetMap = servers.find((s) => s.name === 'OpenStreetMap');
if (!openStreetMap) {
  servers.unshift({
    id: 'OpenStreetMap',
    name: 'OpenStreetMap',
    type: 'tileServer',
    tileServer: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileOptions: { maxZoom: 19 }
  });
} else {
  servers.sort((a, b) => (a.name === 'OpenStreetMap' ? -1 : b.name === 'OpenStreetMap' ? 1 : 0));
}

export default servers;
