// Shared Oxy Metro config (block list, symlink + package-exports resolution,
// web-font/wasm asset exts, minifier, NativeWind). See @oxyhq/app-preset/metro.
const { createOxyMetroConfig } = require('@oxyhq/app-preset/metro');

module.exports = createOxyMetroConfig(__dirname);
