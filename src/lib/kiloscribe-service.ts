import "server-only";

import { 
  AccountId, 
  PrivateKey, 
  Client, 
  TopicCreateTransaction, 
  TopicMessageSubmitTransaction,
  TopicId,
  TransactionReceipt 
} from '@hiero-ledger/sdk';
import type { InscriptionProgress, InscriptionResult } from './kiloscribe-types';

/**
 * Simplified KiloScribe Service using direct Hedera HCS
 * This creates "Hashinals" by inscribing comic data directly to HCS topics
 */
class KiloScribeService {
  private hederaClient: Client;
  private isInitialized = false;
  private accountId?: AccountId;
  private privateKey?: PrivateKey;

  constructor() {
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
    this.hederaClient = network === 'mainnet' 
      ? Client.forMainnet()
      : Client.forTestnet();
  }

  private async initializeHedera(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize with environment credentials if available
      if (process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY) {
        this.accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
        this.privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
        this.hederaClient.setOperator(this.accountId, this.privateKey);
        console.log('✅ Hedera client initialized with credentials');
      } else {
        console.warn('⚠️ No Hedera credentials found in environment variables');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Hedera client:', error);
      throw new Error('Failed to initialize Hedera connection');
    }
  }

  /**
   * Create a comic data package for HCS inscription
   */
  private async createComicInscriptionData(
    comicData: any,
    pages: any[]
  ): Promise<string> {
    try {
      // Create standardized comic inscription data
      const inscriptionData = {
        // Hashinal metadata
        type: 'hashinal-inscription',
        version: '1.0',
        standard: 'quiva-comic',
        created_at: new Date().toISOString(),
        
        // Comic metadata
        comic: {
          id: comicData._id,
          title: comicData.title,
          description: comicData.description,
          genre: comicData.genre,
          tags: comicData.tags,
          ageRating: comicData.ageRating,
          pages: pages.length,
          creator: comicData.creator
        },
        
        // Technical metadata
        technical: {
          originalFormat: 'multipage-comic',
          totalSize: this.calculateTotalSize(comicData, pages),
          pageFormats: pages.map(page => page.blob?.type).filter(Boolean),
          platform: 'quiva-comics'
        },
        
        // Links and references
        references: {
          marketplace_url: `${process.env.NEXT_PUBLIC_APP_URL}/comics/${comicData._id}`,
          collection: 'Quiva Comics',
          publisher: 'Quiva Platform'
        }
      };

      return JSON.stringify(inscriptionData, null, 2);
    } catch (error) {
      console.error('❌ Error creating comic inscription data:', error);
      throw new Error('Failed to create comic inscription data');
    }
  }

  private calculateTotalSize(comicData: any, pages: any[]): number {
    let totalSize = 0;
    
    if (comicData.coverImage?.size) {
      totalSize += comicData.coverImage.size;
    }
    
    pages.forEach(page => {
      if (page.blob?.size) {
        totalSize += page.blob.size;
      }
    });
    
    return totalSize;
  }

  /**
   * Create HCS topic for comic inscription
   */
  private async createInscriptionTopic(comicTitle: string): Promise<TopicId> {
    try {
      const topicMemo = `Quiva Comic Hashinal: ${comicTitle.substring(0, 50)}`;
      
      const topicCreateTx = new TopicCreateTransaction()
        .setTopicMemo(topicMemo)
        .setMaxTransactionFee(5_00_000_000); // 5 HBAR max fee

      const response = await topicCreateTx.execute(this.hederaClient);
      const receipt = await response.getReceipt(this.hederaClient);
      
      if (!receipt.topicId) {
        throw new Error('Topic creation failed - no topic ID returned');
      }

      console.log(`✅ HCS Topic created: ${receipt.topicId.toString()}`);
      return receipt.topicId;
    } catch (error) {
      console.error('❌ Failed to create HCS topic:', error);
      throw new Error(`Failed to create inscription topic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Submit comic data to HCS topic
   */
  private async submitToHCSTopic(
    topicId: TopicId, 
    inscriptionData: string
  ): Promise<string> {
    try {
      // Split large data if needed (HCS has message size limits)
      const maxMessageSize = 1024; // Conservative limit
      const dataChunks = this.splitIntoChunks(inscriptionData, maxMessageSize);
      
      let lastTransactionId = '';
      
      for (let i = 0; i < dataChunks.length; i++) {
        const chunk = dataChunks[i];
        const isLastChunk = i === dataChunks.length - 1;
        
        const message = JSON.stringify({
          chunk: i + 1,
          totalChunks: dataChunks.length,
          isLast: isLastChunk,
          data: chunk
        });

        const messageTx = new TopicMessageSubmitTransaction({
          topicId: topicId,
          message: message,
        }).setMaxTransactionFee(2_00_000_000); // 2 HBAR max fee

        const response = await messageTx.execute(this.hederaClient);
        lastTransactionId = response.transactionId.toString();
        
        console.log(`📝 Submitted chunk ${i + 1}/${dataChunks.length} to HCS topic`);
        
        // Small delay between chunks
        if (!isLastChunk) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return lastTransactionId;
    } catch (error) {
      console.error('❌ Failed to submit to HCS topic:', error);
      throw new Error(`Failed to submit inscription data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private splitIntoChunks(data: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.substring(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Main inscription function
   */
  public async inscribeComic(
    comicData: any,
    pages: any[],
    walletAddress: string,
    onProgress?: (progress: InscriptionProgress) => void
  ): Promise<InscriptionResult> {
    try {
      await this.initializeHedera();
      
      if (!this.isInitialized) {
        throw new Error('Hedera client not properly initialized');
      }

      console.log('🚀 Starting Hedera HCS comic inscription...');
      
      // Step 1: Create inscription data
      onProgress?.({
        step: 'preparing',
        percentage: 10,
        message: 'Preparing comic inscription data...'
      });

      const inscriptionData = await this.createComicInscriptionData(comicData, pages);
      
      // Step 2: Create HCS topic
      onProgress?.({
        step: 'topic',
        percentage: 30,
        message: 'Creating HCS topic for inscription...'
      });

      const topicId = await this.createInscriptionTopic(comicData.title);
      
      // Step 3: Submit to HCS
      onProgress?.({
        step: 'inscribing',
        percentage: 60,
        message: 'Inscribing comic data to Hedera network...'
      });

      const transactionId = await this.submitToHCSTopic(topicId, inscriptionData);
      
      // Step 4: Complete
      onProgress?.({
        step: 'complete',
        percentage: 100,
        message: 'Comic inscription completed successfully!'
      });

      const inscriptionId = `${topicId.toString()}-${Date.now()}`;
      const hashinalsUrl = this.generateHashinalsUrl(topicId.toString(), transactionId);

      console.log('✅ Comic inscription completed:', {
        topicId: topicId.toString(),
        transactionId,
        inscriptionId
      });

      return {
        transactionId,
        inscriptionId,
        status: 'completed',
        hashinalsUrl,
        hcsTopicId: topicId.toString()
      };
      
    } catch (error) {
      console.error('❌ Error during comic inscription:', error);
      
      onProgress?.({
        step: 'error',
        percentage: 0,
        message: `Inscription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      return {
        transactionId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate Hashinals explorer URL
   */
  private generateHashinalsUrl(topicId: string, transactionId: string): string {
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
    const baseUrl = network === 'mainnet' 
      ? 'https://hashscan.io/mainnet' 
      : 'https://hashscan.io/testnet';
    
    return `${baseUrl}/topic/${topicId}`;
  }

  /**
   * Check if inscription is supported
   */
  public async isInscriptionSupported(
    comicData: any,
    pages: any[]
  ): Promise<{ supported: boolean; reason?: string }> {
    try {
      // Check file sizes
      const totalSize = this.calculateTotalSize(comicData, pages);
      
      // 5MB limit for HCS inscription (conservative)
      const maxSize = 5 * 1024 * 1024;
      
      if (totalSize > maxSize) {
        return {
          supported: false,
          reason: `Comic data too large (${(totalSize / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB for Hashinal inscription.`
        };
      }
      
      if (pages.length === 0) {
        return {
          supported: false,
          reason: 'No comic pages found for inscription.'
        };
      }

      // Check if Hedera credentials are available
      if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        return {
          supported: false,
          reason: 'Hedera credentials not configured. Set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY environment variables.'
        };
      }
      
      return { supported: true };
      
    } catch (error) {
      return {
        supported: false,
        reason: 'Error checking inscription compatibility.'
      };
    }
  }

  /**
   * Get inscription details (placeholder for future implementation)
   */
  public async getInscription(inscriptionId: string): Promise<any> {
    try {
      // For now, just return basic info
      // In the future, this could query the HCS topic for the inscription data
      return {
        inscriptionId,
        status: 'completed',
        message: 'Use HashScan to view the full inscription details'
      };
    } catch (error) {
      console.error('❌ Error getting inscription:', error);
      throw error;
    }
  }
}

export const kiloScribeService = new KiloScribeService();
export default KiloScribeService;
