export interface InscriptionRequest {
  fileURL: string;
  jsonFileURL?: string;
  metadata?: {
    name: string;
    description?: string;
    creator?: string;
    collection?: string;
    traits?: Record<string, any>;
  };
}

export interface InscriptionResponse {
  transactionBytes: string;
  transactionId: string;
  inscriptionId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  estimatedCost?: number;
}

export interface InscriptionStatus {
  transactionId: string;
  status: "pending" | "processing" | "completed" | "failed";
  inscriptionId?: string;
  hashinalsUrl?: string;
  metadata?: any;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface HashinalMetadata {
  inscriptionId: string;
  name: string;
  description?: string;
  creator: string;
  collection?: string;
  fileType: string;
  fileSize: number;
  traits?: Record<string, any>;
  createdAt: string;
  hcsReference: string;
}

export interface HashinalInscriptionData {
  title: string;
  description: string;
  creator: string;
  collection?: string;
  fileData: Blob;
  metadata: {
    genre: string[];
    tags: string[];
    ageRating: string;
    comicId: string;
    pages?: number;
    originalFormat: string;
  };
}

export interface InscriptionResult {
  transactionId: string;
  inscriptionId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  hashinalsUrl?: string;
  hcsTopicId?: string;
  error?: string;
}

export interface InscriptionProgress {
  step: string;
  percentage: number;
  message: string;
}
