import "server-only";

import type {
  HashinalMetadata,
  InscriptionRequest,
  InscriptionResponse,
  InscriptionStatus,
} from "./kiloscribe-types";

class KiloScribeClient {
  private baseURL = process.env.KILOSCRIBE_API_URL || 'https://api.kiloscribe.com';
  private apiKey = process.env.KILOSCRIBE_API_KEY;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`KiloScribe API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async startInscription(data: InscriptionRequest): Promise<InscriptionResponse> {
    return this.request<InscriptionResponse>('/api/v1/inscriptions/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInscriptionStatus(transactionId: string): Promise<InscriptionStatus> {
    return this.request<InscriptionStatus>(`/api/v1/inscriptions/status/${transactionId}`);
  }

  async getHashinal(inscriptionId: string): Promise<HashinalMetadata> {
    return this.request<HashinalMetadata>(`/api/v1/hashinals/${inscriptionId}`);
  }

  async getFeaturedHashinals(limit: number = 12): Promise<HashinalMetadata[]> {
    return this.request<HashinalMetadata[]>(`/api/v1/hashinals/featured?limit=${limit}`);
  }

  async searchHashinals(query: string, filters?: {
    collection?: string;
    creator?: string;
    fileType?: string;
  }): Promise<HashinalMetadata[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) searchParams.set(key, value);
      });
    }

    return this.request<HashinalMetadata[]>(`/api/v1/hashinals/search?${searchParams}`);
  }

  // Utility method to generate CDN URL for Hashinal content
  getHashinalUrl(inscriptionId: string): string {
    return `https://cdn.kiloscribe.com/hashinals/${inscriptionId}`;
  }

  // Estimate inscription cost based on file size
  async estimateInscriptionCost(fileSize: number): Promise<{ cost: number; currency: string }> {
    return this.request<{ cost: number; currency: string }>('/api/v1/inscriptions/estimate', {
      method: 'POST',
      body: JSON.stringify({ fileSize }),
    });
  }
}

export const kiloScribeClient = new KiloScribeClient();
export default KiloScribeClient;
