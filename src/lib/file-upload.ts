// lib/file-upload.ts
export interface UploadResult {
  url: string;
  hash?: string;
  size: number;
  type: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class FileUploadService {
  private ipfs?: any;

  constructor() {
    // IPFS client is initialised lazily in uploadToIPFS to avoid SSR issues
  }

  private async getIpfsClient() {
    if (!this.ipfs) {
      if (!process.env.NEXT_PUBLIC_IPFS_URL) return null;
      const { create } = await import('ipfs-http-client');
      this.ipfs = create({
        url: process.env.NEXT_PUBLIC_IPFS_URL,
        headers: process.env.NEXT_PUBLIC_IPFS_API_KEY
          ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_IPFS_API_KEY}` }
          : undefined,
      });
    }
    return this.ipfs;
  }

  async uploadToIPFS(file: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    const ipfs = await this.getIpfsClient();
    if (!ipfs) {
      throw new Error('IPFS not configured');
    }
    this.ipfs = ipfs;

    const fileBuffer = await file.arrayBuffer();
    
    // Create progress tracking
    let loaded = 0;
    const total = file.size;

    try {
      const result = await this.ipfs.add(
        { content: fileBuffer },
        {
          progress: (bytes: number) => {
            loaded += bytes;
            if (onProgress) {
              onProgress({
                loaded,
                total,
                percentage: Math.round((loaded / total) * 100)
              });
            }
          }
        }
      );

      const ipfsUrl = `https://ipfs.io/ipfs/${result.path}`;
      
      return {
        url: ipfsUrl,
        hash: result.path,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      throw new Error(`IPFS upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadToCloudStorage(
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100)
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.url,
              size: file.size,
              type: file.type
            });
          } catch (error) {
            reject(new Error('Invalid response from upload server'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload request failed'));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  }

  async uploadFile(
    file: File,
    strategy: 'ipfs' | 'cloud' = 'ipfs',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Validate file
    this.validateFile(file);

    switch (strategy) {
      case 'ipfs':
        return this.uploadToIPFS(file, onProgress);
      case 'cloud':
        return this.uploadToCloudStorage(file, onProgress);
      default:
        throw new Error(`Unknown upload strategy: ${strategy}`);
    }
  }

  private validateFile(file: File): void {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
      'video/mp4', 'video/webm', 'video/mov',
      'audio/mp3', 'audio/wav', 'audio/ogg',
      'text/html', 'application/json',
      'model/gltf-binary', 'model/gltf+json'
    ];

    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 100MB');
    }

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.glb')) {
      throw new Error('File type not supported for Hashinal inscription');
    }
  }

  // Generate metadata JSON for complex files
  async generateMetadata(file: File, customMetadata: any = {}): Promise<string> {
    const metadata = {
      name: customMetadata.name || file.name.split('.')[0],
      description: customMetadata.description || '',
      creator: customMetadata.creator || '',
      collection: customMetadata.collection || '',
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      },
      traits: customMetadata.traits || {},
      timestamp: new Date().toISOString(),
      ...customMetadata
    };

    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });

    const metadataFile = new File([metadataBlob], 'metadata.json', {
      type: 'application/json'
    });

    const result = await this.uploadFile(metadataFile);
    return result.url;
  }
}

export const fileUploadService = new FileUploadService();
export default FileUploadService;