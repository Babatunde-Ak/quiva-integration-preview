// import crypto from "crypto";

// interface ComicPage {
//   uri: string;
//   mimeType: string;
//   isDefault?: boolean;
//   metadata?: Record<string, any>;
// }

// interface ComicMetadataParams {
//   name: string;
//   creator: string;
//   creatorDID?: string;
//   description?: string;
//   previewURI: string; // Thumbnail or cover
//   previewMime: string;
//   pages: ComicPage[];
//   externalUrl?: string;
//   locales?: string[];
// }

// /**
//  * Build a HIP-412@2.0.0 compliant metadata object for a multi-page comic NFT.
//  */
// export const buildHIP412ComicMetadata = ({
//   name,
//   creator,
//   creatorDID,
//   description,
//   previewURI,
//   previewMime,
//   pages,
//   externalUrl,
//   locales = [],
// }: ComicMetadataParams) => {
//   const hash = crypto.createHash("sha256");

//   // Compute checksum for preview (optional but recommended)
//   hash.update(previewURI);
//   const previewChecksum = hash.digest("hex");

//   const files = pages.map((p, idx) => ({
//     uri: p.uri,
//     type: p.mimeType,
//     is_default_file: !!p.isDefault,
//     metadata: {
//       name: `${name} – Page ${idx + 1}`,
//       description: `Page ${idx + 1} of ${name}`,
//       ...p.metadata,
//     },
//   }));

//   const metadata = {
//     name,
//     creator,
//     creatorDID,
//     description,
//     image: previewURI,
//     checksum: previewChecksum,
//     type: previewMime,
//     format: "HIP412@2.0.0",
//     properties: {
//       total_pages: pages.length,
//       external_url: externalUrl,
//     },
//     files,
//     attributes: [
//       {
//         trait_type: "Total Pages",
//         display_type: "number",
//         value: pages.length,
//       },
//       {
//         trait_type: "Type",
//         value: "Comic Book",
//       },
//     ],
//     ...(locales.length > 0 && {
//       localization: {
//         uri: "ipfs://<cid>/{locale}.json",
//         default: "en",
//         locales,
//       },
//     }),
//   };

//   return metadata;
// };


export const createComicMetadata = ({
  name,
  creator,
  description,
  genres,
  copiesOfComic,
  ageRating,
  coverUri,
  pageUris,
  mimeType = "image/png",
  priceHbar,
  totalPages,
  zipArchiveUri, // Optional: URI of ZIP archive containing all pages
}: {
  name: string;
  creator: string;
  description: string;
  genres: string[];
  copiesOfComic: number;
  ageRating: string;
  coverUri: File | string;
  pageUris: string[];
  mimeType?: string;
  priceHbar: number;
  totalPages: number;
  zipArchiveUri?: string;
}) => {
  // Determine if this is a ZIP-based comic
  const isZipArchive = zipArchiveUri != null || mimeType === "application/zip";
  
  return {
    name,
    creator,
    description,
    image: coverUri, // preview / cover
    type: isZipArchive ? "application/zip" : mimeType,
    format: "HIP412@2.0.0",
    properties: {
      genres,
      ageRating,
      copiesOfComic,
      priceHbar,
      totalPages,
      category: "ComicBook",
      // Add ZIP-specific properties
      ...(isZipArchive && {
        archiveFormat: "zip",
        archiveUri: zipArchiveUri || pageUris[0],
      }),
    },
    files: isZipArchive 
      ? [{
          uri: zipArchiveUri || pageUris[0],
          type: "application/zip",
          is_default_file: true,
          metadata: {
            name: `${name} - Comic Archive`,
            description: `ZIP archive containing all pages of ${name}`,
          },
        }]
      : pageUris.map((uri, i) => ({
          uri,
          type: mimeType,
          is_default_file: i === 0, // first page default
          metadata: {
            name: `${name} - Page ${i + 1}`,
            description: `Page ${i + 1} of ${name}`,
          },
        })),
  };
};
