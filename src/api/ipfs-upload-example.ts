// Example API endpoint structure for backend integration
// This should be implemented in your backend server

/*
POST /api/ipfs/upload-comic

Request Body (FormData):
- coverImage: File (optional)
- pages: File[] (required)
- title: string
- description: string
- genre: string (JSON array)
- tags: string (JSON array)
- ageRating: string

Response:
{
  "success": true,
  "data": {
    "metadataUri": "ipfs://QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Main metadata JSON
    "coverImageUri": "ipfs://QmYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY", // Cover image hash
    "pagesUris": [
      "ipfs://QmZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ1", // Page 1 hash
      "ipfs://QmZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ2", // Page 2 hash
      // ... more page hashes
    ]
  }
}

The metadata JSON stored at metadataUri should follow this structure:
{
  "name": "Comic Title - Episode 1",
  "description": "Comic description",
  "image": "ipfs://QmYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY", // Cover image
  "attributes": [
    {
      "trait_type": "Creator",
      "value": "Creator Address"
    },
    {
      "trait_type": "Genre",
      "value": "Action, Adventure"
    },
    {
      "trait_type": "Age Rating",
      "value": "Teen"
    },
    {
      "trait_type": "Page Count",
      "value": 20
    }
  ],
  "properties": {
    "pages": [
      "ipfs://QmZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ1",
      "ipfs://QmZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ2"
      // ... all page hashes
    ],
    "genre": ["Action", "Adventure"],
    "tags": ["superhero", "manga", "series"],
    "ageRating": "teen"
  }
}
*/

// Example implementation notes for backend:
/*
1. Upload individual images to IPFS using libraries like:
   - ipfs-http-client
   - pinata SDK
   - web3.storage
   - nft.storage

2. Create metadata JSON with proper structure
3. Upload metadata JSON to IPFS
4. Return all IPFS hashes to frontend

Example with Pinata:
```javascript
const pinata = require('@pinata/sdk')('YOUR_API_KEY', 'YOUR_SECRET_KEY');

// Upload images
const coverImageResult = await pinata.pinFileToIPFS(coverImageFile);
const pageResults = await Promise.all(
  pageFiles.map(file => pinata.pinFileToIPFS(file))
);

// Create metadata
const metadata = {
  name: `${title} - Episode 1`,
  description,
  image: `ipfs://${coverImageResult.IpfsHash}`,
  attributes: [...],
  properties: {
    pages: pageResults.map(result => `ipfs://${result.IpfsHash}`),
    genre,
    tags,
    ageRating
  }
};

// Upload metadata
const metadataResult = await pinata.pinJSONToIPFS(metadata);
```
*/

export {};