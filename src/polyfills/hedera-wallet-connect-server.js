'use strict';

// Server-side stub for @hashgraph/hedera-wallet-connect.
// The real package cannot be loaded in Node.js because its dist/index.js
// uses ESM directory imports (export * from './lib') which fail at runtime.
// This stub is only used server-side; the browser gets the real package.
// All hooks that use these classes are inside useEffect, which is a no-op
// during SSR, so the actual values never matter on the server.

class DAppConnector {
  async init() {}
  async openModal() { return null; }
  get signers() { return []; }
  get walletConnectClient() { return null; }
  getSigner() { return null; }
  async disconnect() {}
}

const HederaSessionEvent = {
  ChainChanged: 'chainChanged',
  AccountsChanged: 'accountsChanged',
};

const HederaJsonRpcMethod = {};

const HederaChainId = {
  Testnet: '0:296',
  Mainnet: '0:295',
};

module.exports = {
  DAppConnector,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  HederaChainId,
};
