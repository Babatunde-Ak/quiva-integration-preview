// // Source - https://stackoverflow.com/a
// // Posted by jo-chris
// // Retrieved 2025-12-07, License - CC BY-SA 4.0

// const webpack = require('webpack')
    
//     module.exports = function override(config) {
//       const fallback = config.resolve.fallback || {}
//       Object.assign(fallback, {
//         fs: require.resolve('graceful-fs'),
//         crypto: false, // require.resolve("crypto-browserify") can be polyfilled here if needed
//         stream: require.resolve('stream-browserify'),
//         constants: require.resolve('constants-browserify'),
//         assert: false, // require.resolve("assert") can be polyfilled here if needed
//         http: require.resolve('stream-http'),
//         https: require.resolve('https-browserify'),
//         os: false, // require.resolve("os-browserify") can be polyfilled here if needed
//         url: require.resolve('url'),
//         zlib: require.resolve('browserify-zlib'),
//         path: require.resolve('path-browserify'),
//         util: require.resolve('util'),
//         net: false,
//       })
//       config.resolve.fallback = fallback
//       config.plugins.push(
//         new webpack.ProvidePlugin({
//           process: 'process/browser',
//           Buffer: ['buffer', 'Buffer'],
//         }),
//         new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
//           const mod = resource.request.replace(/^node:/, '')
//           switch (mod) {
//             case 'net':
//               resource.requeset = 'net'
//               break
//             case 'util':
//               resource.request = 'util'
//               break
//             case 'path':
//               resource.request = 'path'
//               break
//             case 'http':
//               resource.request = 'stream-http'
//               break
//             case 'https':
//               resource.request = 'https-browserify'
//               break
//             case 'zlib':
//               resource.request = 'browserify-zlib'
//               break
//             case 'url':
//               resource.request = 'url'
//               break
//             case 'fs':
//               resource.request = 'fs'
//               break
//             case 'buffer':
//               resource.request = 'buffer'
//               break
//             case 'stream':
//               resource.request = 'readable-stream'
//               break
//             default:
//               throw new Error(`Not found ${mod}`)
//           }
//         }),
//       )
//       config.ignoreWarnings = [/Failed to parse source map/]
//       config.module.rules.push({
//         test: /\.(js|mjs|jsx)$/,
//         enforce: 'pre',
//         loader: require.resolve('source-map-loader'),
//         resolve: {
//           fullySpecified: false,
//         },
//       })
//       return config
//     }
