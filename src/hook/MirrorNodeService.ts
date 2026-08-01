/**
 * Mirror Node Service
 * Utilities for querying Hedera Mirror Node API
 */

import { ContractId } from "@hiero-ledger/sdk";

export interface MirrorNodeConfig {
  network: 'testnet' | 'mainnet';
}

export interface DirectListingData {
  listingId: string;
  episodeId: string;
  creator: string;
  pricePerNFT: string; // in tinybars
  available: number;
  isActive: boolean;
}

export interface EpisodeData {
  tokenAddress: string;
  creator: string;
  name: string;
  maxSupply: number;
  currentSupply: number;
  exists: boolean;
}

export interface MarketplaceListing {
  tokenAddress: string;
  serialNumber: number;
  seller: string;
  price: string; // in tinybars
  isActive: boolean;
}

export interface CampaignData {
  episodeId: string;
  creator: string;
  campaignType: number;
  mintPrice: string; // in tinybars
  maxSupply: string;
  totalMinted: string;
  isActive: boolean;
}

class MirrorNodeService {
  private baseUrl: string;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.baseUrl = network === 'testnet'
      ? 'https://testnet.mirrornode.hedera.com'
      : 'https://mainnet.mirrornode.hedera.com';
  }

  /**
   * Get Mirror Node base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Format transaction ID for Mirror Node queries
   */
  formatTxIdForMirror(txIdStr: string): string {
    return txIdStr
      .replace("@", "-")
      .replace(/\./g, (match, offset, string) => {
        const dotCount = string.slice(0, offset + 1).split('.').length - 1;
        return dotCount <= 2 ? "." : "-";
      });
  }

  /**
   * Convert EVM address to Hedera format (0.0.x)
   */
  evmAddressToHederaId(evmAddress: string): string {
    // Remove 0x prefix if present
    const cleanAddress = evmAddress.replace('0x', '');
    // Convert hex to decimal
    const decimal = parseInt(cleanAddress, 16);
    return `0.0.${decimal}`;
  }

  /**
   * Convert Hedera ID to EVM address
   */
  hederaIdToEvmAddress(hederaId: string): string {
    const contractAddress = ContractId.fromString(hederaId).toEvmAddress();
    return contractAddress;
  }

  /**
   * Convert an amount expressed in Hedera units to HBAR.
   *
   * Mirror Node sometimes returns 18-decimal HBAR values for contract call results,
   * and other APIs may return 8-decimal tinybars. We auto-detect the magnitude.
   */
  tinybarsToHbar(value: string | number): number {
    const raw = String(value).trim();
    if (!raw) return 0;

    const isNegative = raw.startsWith("-");
    const abs = isNegative ? raw.slice(1) : raw;
    const len = abs.replace(/^0+/, "").length;

    if (len === 0) return 0;

    const n = Number(raw);
    if (Number.isNaN(n)) return 0;

    if (len > 18) {
      return n / 1e18;
    }
    if (len > 8) {
      return n / 1e8;
    }
    return n;
  }

  /**
   * Convert HBAR to tinybars.
   */
//   hbarToTinybars(hbar: string | number): string {
//     const value = String(hbar).trim();
//     const [whole, fraction = ""] = value.split('.');
//     const normalizedFraction = (fraction + '00000000').slice(0, 8);
//     const tinybars = BigInt(whole || '0') * 100000000n + BigInt(normalizedFraction);
//     return tinybars.toString();
//   }

  /**
   * Make contract call via Mirror Node
   */
  async makeContractCall(
    contractId: string,
    encodedData: string,
    block: 'latest' | number = 'latest'
  ): Promise<any> {
    try {
      // Convert contract ID to EVM address if needed
      const contractAddress = this.hederaIdToEvmAddress(contractId);

      const payload = {
        block,
        data: encodedData,
        to: contractAddress,
      };

      const response = await fetch(`${this.baseUrl}/api/v1/contracts/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        const fallbackPayload = {
          block,
          data: encodedData,
          contract_id: contractId,
        };

        console.warn('Mirror Node call failed, trying fallback payload', {
          status: response.status,
          statusText: response.statusText,
          responseText,
          payload,
          fallbackPayload,
        });

        const fallbackResponse = await fetch(`${this.baseUrl}/api/v1/contracts/call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fallbackPayload),
        });

        if (!fallbackResponse.ok) {
          const fallbackText = await fallbackResponse.text();
          throw new Error(`Mirror Node call failed: ${response.statusText} / ${responseText} / fallback: ${fallbackResponse.statusText} / ${fallbackText}`);
        }

        return await fallbackResponse.json();
      }

      return await response.json();
    } catch (error) {
      console.error('Mirror Node contract call error:', error);
      throw error;
    }
  }

  /**
   * Get contract result by transaction ID
   */
  async getContractResult(transactionId: string): Promise<any> {
    try {
      const formattedTxId = this.formatTxIdForMirror(transactionId);
      const response = await fetch(
        `${this.baseUrl}/api/v1/contracts/results/${formattedTxId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get contract result: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching contract result:', error);
      throw error;
    }
  }

  /**
   * Get NFT info by token ID and serial number
   */
  async getNftInfo(tokenId: string, serialNumber?: number): Promise<any> {
    try {
      const url = serialNumber
        ? `${this.baseUrl}/api/v1/tokens/${tokenId}/nfts/${serialNumber}`
        : `${this.baseUrl}/api/v1/tokens/${tokenId}/nfts`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get NFT info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching NFT info:', error);
      throw error;
    }
  }

  /**
   * Get token info
   */
  async getTokenInfo(tokenId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/tokens/${tokenId}`);

      if (!response.ok) {
        throw new Error(`Failed to get token info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw error;
    }
  }

  /**
   * Get all NFTs for a specific token (all instances, any owner)
   */
  async getTokenNfts(tokenId: string, limit: number = 1000): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/v1/tokens/${tokenId}/nfts?limit=${limit}`;
      
      console.log('📡 Mirror Node request (all token NFTs):', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get token NFTs: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Mirror Node response (all token NFTs):', data);
      return data;
    } catch (error) {
      console.error('Error fetching token NFTs:', error);
      throw error;
    }
  }

  /**
   * Get account NFTs
   */
  async getAccountNfts(accountId: string, tokenId?: string): Promise<any> {
    try {
      let url = `${this.baseUrl}/api/v1/accounts/${accountId}/nfts?limit=1000`;
      if (tokenId) {
        url += `&token.id=${tokenId}`;
      }

      console.log('📡 Mirror Node request:', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get account NFTs: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Mirror Node full response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching account NFTs:', error);
      throw error;
    }
  }


    
  /**
   * Get transaction info
   */
  async getTransaction(transactionId: string): Promise<any> {
    try {
      const formattedTxId = this.formatTxIdForMirror(transactionId);
      const response = await fetch(
        `${this.baseUrl}/api/v1/transactions/${formattedTxId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get transaction: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Poll for transaction result with retry
   */
  async pollForTransaction(
    transactionId: string,
    maxAttempts: number = 10,
    delayMs: number = 2000
  ): Promise<any> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await this.getTransaction(transactionId);
        if (result && result.transactions && result.transactions.length > 0) {
          return result;
        }
      } catch (error) {
        if (attempt === maxAttempts - 1) throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    throw new Error('Transaction not found after polling');
  }

  /**
   * Extract return value from contract call result
   */
  extractReturnValue(callResult: string, startPosition: number = 0): string {
    if (!callResult || callResult === '0x') return '';
    // Remove 0x prefix and extract 32-byte chunks
    const cleanResult = callResult.replace('0x', '');
    const chunkSize = 64; // 32 bytes in hex
    const start = startPosition * chunkSize;
    return '0x' + cleanResult.slice(start, start + chunkSize);
  }

  /**
   * Decode address from contract result
   */
  decodeAddress(hexValue: string): string {
    if (!hexValue || hexValue === '0x') return '';
    const cleanHex = hexValue.replace('0x', '');
    // Take last 40 characters (20 bytes)
    return '0x' + cleanHex.slice(-40);
  }

  /**
   * Decode uint256 from contract result
   */
  decodeUint256(hexValue: string): string {
    if (!hexValue || hexValue === '0x') return '0';
    return BigInt(hexValue).toString();
  }

  /**
   * Decode bool from contract result
   */
  decodeBool(hexValue: string): boolean {
    if (!hexValue || hexValue === '0x') return false;
    return BigInt(hexValue) !== BigInt(0);
  }

  /**
   * Decode string from contract result
   */
  decodeString(hexValue: string): string {
    if (!hexValue || hexValue === '0x') return '';
    const cleanHex = hexValue.replace('0x', '');
    let str = '';
    for (let i = 0; i < cleanHex.length; i += 2) {
      const charCode = parseInt(cleanHex.substr(i, 2), 16);
      if (charCode !== 0) str += String.fromCharCode(charCode);
    }
    return str;
  }
}

// Create singleton instance
export const mirrorNodeService = new MirrorNodeService('testnet');

export default MirrorNodeService;