// /** @type {import('next').NextConfig} */
// const nextConfig = {
//    transpilePackages: [
//     "@hashgraph/hedera-wallet-connect",
//     "@reown/walletkit",
//     "@walletconnect/modal",
//     "ethers",
//   ],
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**",
//       },
//     ],
//     unoptimized: true,
//   },

//   eslint: {
//     ignoreDuringBuilds: true,
//   },

//   typescript: {
//     ignoreBuildErrors: true,
//   },

//   webpack: (config) => {
//     // Fix for @metamask/sdk trying to import react-native dependencies
//     config.resolve.fallback = {
//       ...config.resolve.fallback,
//       '@react-native-async-storage/async-storage': false,
//     };
//     return config;
//   },
// };

// module.exports = nextConfig;


// /** @type {import('next').NextConfig} */
// const webpack = require('webpack');

// const nextConfig = {
//   transpilePackages: [
//     "@hashgraph/hedera-wallet-connect",
//     "@reown/walletkit",
//     "@walletconnect/modal",
//     "ethers",
//   ],
  
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**",
//       },
//     ],
//     unoptimized: true,
//   },

//   eslint: {
//     ignoreDuringBuilds: true,
//   },

//   typescript: {
//     ignoreBuildErrors: true,
//   },

//   webpack: (config, { isServer }) => {
//     // Fix for @metamask/sdk trying to import react-native dependencies
//     config.resolve.fallback = {
//       ...config.resolve.fallback,
//       '@react-native-async-storage/async-storage': false,
//     };

//     // Handle node: protocol imports for Web3 libraries
//     if (!isServer) {
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         '@react-native-async-storage/async-storage': false,
//         buffer: require.resolve('buffer/'),
//         stream: require.resolve('stream-browserify'),
//         crypto: require.resolve('crypto-browserify'),
//         http: require.resolve('stream-http'),
//         https: require.resolve('https-browserify'),
//         os: require.resolve('os-browserify/browser'),
//         path: require.resolve('path-browserify'),
//         process: require.resolve('process/browser'),
//         url: require.resolve('url/'),
//         assert: require.resolve('assert/'),
//         zlib: require.resolve('browserify-zlib'),
//         util: require.resolve('util/'),
//       };

//       // Provide plugin for process and Buffer
//       config.plugins.push(
//         new webpack.ProvidePlugin({
//           Buffer: ['buffer', 'Buffer'],
//           process: 'process/browser',
//         })
//       );
//     }

//     // Handle 'node:' prefix scheme
//     config.resolve.alias = {
//       ...config.resolve.alias,
//       'node:buffer': require.resolve('buffer/'),
//       'node:stream': require.resolve('stream-browserify'),
//       'node:crypto': require.resolve('crypto-browserify'),
//       'node:http': require.resolve('stream-http'),
//       'node:https': require.resolve('https-browserify'),
//       'node:os': require.resolve('os-browserify/browser'),
//       'node:path': require.resolve('path-browserify'),
//       'node:process': require.resolve('process/browser'),
//       'node:url': require.resolve('url/'),
//       'node:util': require.resolve('util/'),
//     };

//     return config;
//   },
// };

// module.exports = nextConfig;



// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   transpilePackages: [
//     "@hashgraph/hedera-wallet-connect",
//     "@reown/walletkit",
//     "@walletconnect/modal",
//     "ethers",
//   ],
  
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**",
//       },
//     ],
//     unoptimized: true,
//   },

//   eslint: {
//     ignoreDuringBuilds: true,
//   },

//   typescript: {
//     ignoreBuildErrors: true,
//   },

//   webpack: (config, { isServer, webpack }) => {
//     // Fix for @metamask/sdk trying to import react-native dependencies
//     config.resolve.fallback = {
//       ...config.resolve.fallback,
//       '@react-native-async-storage/async-storage': false,
//     };

//     if (!isServer) {
//       // Resolve node: protocol imports
//       config.resolve = {
//         ...config.resolve,
//         alias: {
//           ...config.resolve.alias,
//           'node:buffer': 'buffer',
//           'node:stream': 'stream-browserify',
//           'node:crypto': 'crypto-browserify',
//           'node:http': 'stream-http',
//           'node:https': 'https-browserify',
//           'node:os': 'os-browserify/browser',
//           'node:path': 'path-browserify',
//           'node:process': 'process/browser',
//         },
//         fallback: {
//           ...config.resolve.fallback,
//           buffer: require.resolve('buffer'),
//           stream: require.resolve('stream-browserify'),
//           crypto: require.resolve('crypto-browserify'),
//           http: require.resolve('stream-http'),
//           https: require.resolve('https-browserify'),
//           os: require.resolve('os-browserify/browser'),
//           path: require.resolve('path-browserify'),
//           process: require.resolve('process/browser'),
//           url: require.resolve('url'),
//           assert: require.resolve('assert'),
//           zlib: require.resolve('browserify-zlib'),
//           util: require.resolve('util'),
//           fs: false,
//           net: false,
//           tls: false,
//           dns: false,
//           child_process: false,
//         },
//       };

//       // Provide plugin for global variables
//       config.plugins = [
//         ...config.plugins,
//         new webpack.ProvidePlugin({
//           Buffer: ['buffer', 'Buffer'],
//           process: 'process/browser',
//         }),
//       ];
//     }

//     return config;
//   },
// };

// module.exports = nextConfig;

 /** @type {import('next').NextConfig} */

const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const nextConfig = {
  eslint: {
    // Ignore ESLint errors during Vercel builds
    ignoreDuringBuilds: true,
  },
  
  // Configure image domains for external images (IPFS gateways, etc.)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
      },
      {
        protocol: "https",
        hostname: "*.pinata.cloud",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
      },
      {
        protocol: "https",
        hostname: "dweb.link",
      },
      {
        protocol: "https",
        hostname: "*.ipfs.dweb.link",
      },
    ],
    // Optionally disable optimization for external images
    unoptimized: true,
  },

webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      tap: false,
      'node:buffer': 'buffer',
      'node:crypto': 'crypto-browserify',
      'node:path': 'path-browserify',
      crypto: 'crypto-browserify',
      path: 'path-browserify',
    };
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      assert: require.resolve('assert'),
      os: require.resolve('os-browserify/browser'),
       '@react-native-async-storage/async-storage': false,
    };
    config.resolve.extensions = [
      '.ts',
      '.tsx',
      '.mjs',
      '.js',
      '.jsx',
      '.json',
      '.wasm',
    ];
    config.plugins = config.plugins ?? [];
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: ['process'],
      }),
      new NodePolyfillPlugin(),
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      })
    );
    return config;
  },
  transpilePackages: [
    '@hashgraphonline/hashinal-wc',
    '@hashgraphonline/standards-sdk',
  ]
}

module.exports = nextConfig;