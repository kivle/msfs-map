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

export {
  providerRequiresApiKey,
  resolveAttribution
};
