const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  // Remove or comment out any extraNodeModules mapping for @babel/runtime
  // config.resolver.extraNodeModules = { ... };

  return config;
})();
