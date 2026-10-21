// Shared Oxy Metro config (block list, symlink + package-exports resolution,
// web-font/wasm asset exts, minifier, NativeWind). See @oxy.so/app-preset/metro.
const { createOxyMetroConfig } = require('@oxy.so/app-preset/metro');

module.exports = createOxyMetroConfig(__dirname);
