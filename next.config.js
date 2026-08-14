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

const path = require('path');
const webpack = require('webpack');

const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  eslint: {
    // Ignore ESLint errors during Vercel builds
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Prevent webpack from bundling these packages for SSR — Node.js loads them natively.
    // NOTE: @hashgraph/hedera-wallet-connect is intentionally excluded here. Its dist/index.js
    // uses ESM directory imports (export * from './lib') that fail when Node.js require()s it.
    // Instead we alias it to a server-safe stub via the webpack config below.
    serverComponentsExternalPackages: [
      '@hashgraph/sdk',
      '@hashgraph/proto',
      '@hashgraph/cryptography',
      'protobufjs',
      'long',
    ],
  },
  
  // Configure image domains for external images (IPFS gateways, etc.)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

webpack: (config, { isServer }) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      tap: false,
      'node:buffer': 'buffer',
      'node:crypto': path.resolve(__dirname, 'src/polyfills/crypto.js'),
      'node:path': 'path-browserify',
      crypto: path.resolve(__dirname, 'src/polyfills/crypto.js'),
      path: 'path-browserify',
      '@hiero-ledger/sdk': path.resolve(__dirname, 'node_modules/@hiero-ledger/sdk/lib/browser.js'),
      '@hiero-ledger/proto': require.resolve('@hashgraph/proto'),
      '@hiero-ledger/cryptography': require.resolve('@hashgraph/cryptography'),
      // For client builds, redirect @hashgraph/sdk to its browser build (no gRPC/http2/fs).
      // Must alias both the package root AND the direct .cjs path that
      // @hashgraph/hedera-wallet-connect hardcodes in its dist bundle.
      ...(!isServer ? {
        '@hashgraph/sdk': path.resolve(__dirname, 'node_modules/@hashgraph/sdk/lib/browser.js'),
        [path.resolve(__dirname, 'node_modules/@hashgraph/sdk/lib/index.cjs')]:
          path.resolve(__dirname, 'node_modules/@hashgraph/sdk/lib/browser.cjs'),
      } : {
        // On the server, @hashgraph/hedera-wallet-connect dist/index.js uses
        // ESM directory imports that crash Node.js require(). Use a CJS stub
        // instead — all usage is inside useEffect so values never matter in SSR.
        '@hashgraph/hedera-wallet-connect': path.resolve(__dirname, 'src/polyfills/hedera-wallet-connect-server.js'),
      }),
    };
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      buffer: require.resolve('buffer'),
      crypto: path.resolve(__dirname, 'src/polyfills/crypto.js'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      assert: require.resolve('assert'),
      os: require.resolve('os-browserify/browser'),
      '@react-native-async-storage/async-storage': false,
      // Node.js-only modules — only stub for client bundle
      ...(!isServer ? {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        http2: false,
      } : {}),
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
    // On the server, mark @hashgraph/* (except hedera-wallet-connect, which is aliased to a
    // CJS stub above), protobufjs sub-paths, and long as CommonJS externals. This catches
    // hardcoded sub-path imports in @hashgraph/* dist bundles that serverComponentsExternalPackages
    // cannot match by name alone.
    if (isServer) {
      const existing = config.externals ?? [];
      // IMPORTANT: our CJS externals function must come FIRST before the
      // serverComponentsExternalPackages externals. Those use the `module`
      // external type which generates `import()` (async) instead of `require()`.
      // For @hashgraph/* packages, async externals make HashPackProvider's
      // module async, causing its exports to be undefined during SSR.
      config.externals = [
        ({ request }, callback) => {
          if (
            (request.startsWith('@hashgraph/') && request !== '@hashgraph/hedera-wallet-connect') ||
            request.startsWith('protobufjs') ||
            request === 'long'
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
        ...(Array.isArray(existing) ? existing : [existing]),
      ];
    }

    config.plugins = config.plugins ?? [];
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: ['process'],
      }),

      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      })
    );
    return config;
  },
  transpilePackages: [
    'recharts',
    '@hashgraphonline/hashinal-wc',
    '@hashgraphonline/standards-sdk',
    '@heroui/react',
    '@heroui/system',
    '@heroui/theme',
  ]
}

module.exports = nextConfig;