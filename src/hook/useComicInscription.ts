// import { useRef, useState } from "react";
// import { inscribeWithSigner, retrieveInscription } from "@hashgraphonline/standards-sdk";
// import { Buffer } from "buffer";

// interface UseComicInscriptionProps {
//   accountId: string;
//   signer: any;
//   network?: "testnet" | "mainnet";
// }

// interface InscriptionFormData {
//   zipFile?: File;
//   pdfFile?: File;
//   description?: string;
// }

// export function useComicInscription({
//   accountId,
//   signer,
//   network = "testnet",
// }: UseComicInscriptionProps) {
//   const [status, setStatus] = useState<"idle" | "inscribing" | "done" | "error">("idle");
//   const [progress, setProgress] = useState<number>(0);
//   const [error, setError] = useState<string | null>(null);
//   const [result, setResult] = useState<any>(null);
//   const [statusText, setStatusText] = useState<string>("");
//   const inscriptionCompleted = useRef(false);
//   const lastValidProgress = useRef(0);

//   const createInscription = async (formData: InscriptionFormData) => {
//     try {
//       if (!signer || typeof signer.sign !== "function") {
//         throw new Error("No valid signer. Please connect your wallet.");
//       }

//       if (!formData.zipFile && !formData.pdfFile) {
//         throw new Error("No ZIP or PDF file provided for inscription.");
//       }

//       setStatus("inscribing");
//       setProgress(0);

//       const fileToInscribe = formData.zipFile || formData.pdfFile!;
//       const arrayBuffer = await fileToInscribe.arrayBuffer();

//       // const progressCallback = (data: any) => {
//       //   console.log(`[${data.step || "unknown"}] ${data.message || ""} - ${data.progressPercent || 0}%`);

//       //   if (inscriptionCompleted.current) {
//       //     setProgress(100);
//       //     return;
//       //   }

//       //   if (data.step === "completed" || data.progressPercent >= 100) {
//       //     inscriptionCompleted.current = true;
//       //     lastValidProgress.current = 100;
//       //     setProgress(100);
//       //     setStatusText("Inscription completed");
//       //     return;
//       //   }

//       //   if (data.step === "failed") {
//       //     setError(data.message || "Inscription failed");
//       //     setStatus("error");
//       //     return;
//       //   }

//       //   const currentProgress = data.progressPercent || 0;
//       //   if (currentProgress > lastValidProgress.current) {
//       //     lastValidProgress.current = currentProgress;
//       //     setProgress(currentProgress);
//       //   }
//       // };

//       // ✳️ Perform inscription
//       const inscriptionResult = await inscribeWithSigner(
//         {
//           type: "buffer",
//           buffer: Buffer.from(arrayBuffer),
//           fileName: fileToInscribe.name,
//           mimeType: fileToInscribe.type || "application/zip",
//         },
//         signer,
//         {
//           mode: "hashinal-collection",
//           waitForConfirmation: true,
//           waitMaxAttempts: 50,
//           waitIntervalMs: 8000,
//           chunkSize: 1024 * 256,
//           network,
//           // progressCallback,
//              progressCallback: (data: any) => {
//             const pct = Math.min(data.progressPercent || 0, 95);
//             setProgress(pct);
//             setStatusText(data.message || "Inscribing...");
//           },
//         }
//       );

//       // const transactionId = inscriptionResult?.inscription?.transactionId;
//       // if (!transactionId) throw new Error("Failed to get inscription transaction ID");

//       // console.log("🧾 Transaction ID:", transactionId);
//          const transactionId = (() => {
//         // Prefer explicit inscription.transactionId
//         const insTx = inscriptionResult?.inscription?.transactionId;
//         if (insTx) return insTx;
//         console.log('Inscription result:', insTx);
//         // If result is a plain string, treat it as the transactionId
//         if (typeof inscriptionResult?.result === "string") return inscriptionResult!.result;
//         console.log('Inscription result object:', inscriptionResult?.result);
//         // If result is an object that contains transactionId, use it
//         if (inscriptionResult?.result && typeof inscriptionResult.result === "object") {
//           if ("transactionId" in inscriptionResult.result) {
//             return (inscriptionResult.result as any).transactionId;
//             console.log('Found transactionId in result:', (inscriptionResult.result as any).transactionId);
//           }
//           // Some implementations may nest transactionId under result.transaction
//           if ("transaction" in inscriptionResult.result && (inscriptionResult.result as any).transaction?.transactionId) {
//             return (inscriptionResult.result as any).transaction.transactionId;
//           }
//         }
//         return undefined;
//       })();

// if (!transactionId) {
//   throw new Error("Failed to get inscription transaction ID");
// }

//       //🧠 Retrieve final details
//     //  const retrieved = await retrieveInscription(transactionId, { network });
//     //   console.log("📦 Retrieved Inscription:", retrieved);

//     //   // Extract topic IDs for metadataUploads
//     //   const metadataTopicIds =
//     //     retrieved?.metadataUploads[0]?.map((m: any) => m.topicId) || [];

//     //   const topicId = inscriptionResult?.inscription?.topic_id;
//     //   console.log("✅ Inscription Topic ID:", topicId);
//     //   console.log("🧩 Metadata Topic IDs:", metadataTopicIds);
//     // ✅ Try both API-like and SDK-like responses

//     // ✅ Step: Retrieve full inscription result directly from the Hashinals API
// // const API_BASE = `http://v2-api.tier.bot/api/inscriptions/retrieve-inscription?id=${transactionId}&network=${network}``

// const response = await fetch(`http://v2-api.tier.bot/api/inscriptions/retrieve-inscription?id=${transactionId}&network=${network}`);
// if (!response.ok) {
//   throw new Error(`Failed to retrieve inscription: ${response.statusText}`);
// }
//  console.log("Response retrieve", response);
// const retrieved = await response.json();

// // ✅ Extract metadata topic IDs
// const metadataTopicIds: string[] =
//   retrieved?.files?.metadataUploads?.map((m: any) => m.topicId) || [];

// console.log("🧩 Metadata Topic IDs:", metadataTopicIds);

// // Optionally log all files if you want visibility
// console.log("📁 Inscription Files:", retrieved?.files);


//       const inscriptionData = {
//         jobId: inscriptionResult?.inscription?.jobId,
//         transactionId,
//         // topicId,
//         metadataTopicIds,
//         result: retrieved,
//       };

//       setResult(inscriptionData);
//       setStatus("done");
//       setProgress(100);

//       return inscriptionData;
//     } catch (err: any) {
//       console.error("❌ Inscription error:", err);
//       setError(err.message || "Unexpected error during inscription.");
//       setStatus("error");
//       throw err;
//     }
//   };

//   return { createInscription, status, progress, result, error, statusText };
// }


import { useRef, useState } from "react";
import { inscribeWithSigner, retrieveInscription } from "@hashgraphonline/standards-sdk";
import { Buffer } from "buffer";
import axiosInstance from "@/redux/axios-instance";
import axios from "axios";

interface UseComicInscriptionProps {
  accountId: string;
  signer: any;
  network?: "testnet" | "mainnet";
}

interface InscriptionFormData {
  zipFile?: File;
  pdfFile?: File;
  imageFiles?: File[];  // Support for individual image files
  description?: string;
}

interface ComicData {
  title: string;
  description: string;
  genre: string[];
  tags: string[];
  ageRating: string;
  coverImage: File | null;
  pages: any[];
}

interface MonetizationData {
  publishType: 'free' | 'paid';
  price?: number;
  mintAsNFT: boolean;
  nftCopies?: number;
  nftPrice?: number;
}

export function useComicInscription({
  accountId,
  signer,
  network = "testnet",
}: UseComicInscriptionProps) {
  const [status, setStatus] = useState<"idle" | "inscribing" | "done" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [statusText, setStatusText] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const inscriptionCompleted = useRef(false);
  const lastValidProgress = useRef(0);

  const createInscription = async (comicData: ComicData,  monetizationData: MonetizationData ) => {
    try {
      if (!signer || typeof signer.sign !== "function") {
        throw new Error("No valid signer. Please connect your wallet.");
      }

      const formData = new FormData();

      // Add cover image if exists
      if (comicData.coverImage) {
        if (comicData.coverImage instanceof File) {
          formData.append('coverImage', comicData.coverImage);
        } else {
          const coverFile = new File(
            [comicData.coverImage],
            'cover.jpg',
            { type: (comicData.coverImage as Blob).type || 'image/jpeg' }
          );
          formData.append('coverImage', coverFile);
        }
      }

      // Add page files (images, ZIP, or PDF)
      comicData.pages.forEach((page, index) => {
        if (page.blob) {
          const fileName = page.name || `page-${index + 1}.jpg`;
          
          // Determine the correct mime type based on page type
          let mimeType = page.blob.type || 'image/jpeg';
          if (page.type === 'zip-images') {
            mimeType = 'application/zip';
          } else if (page.type === 'pdf-file') {
            mimeType = 'application/pdf';
          }
          
          // Create the file with proper type
          const file = page.blob instanceof File 
            ? page.blob 
            : new File([page.blob], fileName, { type: mimeType });
          
          // Use appropriate field name based on file type
          // Backend expects 'pages' for all file types (images, ZIP, PDF)
          if (page.type === 'zip-images') {
            formData.append('pages', file);  // Changed from 'zipFile' to 'pages'
          } else if (page.type === 'pdf-file') {
            formData.append('pages', file);  // Changed from 'pdfFile' to 'pages'
          } else {
            formData.append('pages', file);
          }
          
          console.log(`📎 Added ${page.type || 'image'} file:`, fileName, 'Size:', file.size, 'Type:', file.type);
        }
      }); 

      // Append individual fields as expected by the backend (matching curl format)
      formData.append('title', comicData.title);
      formData.append('description', comicData.description);
      formData.append('genre', Array.isArray(comicData.genre) ? comicData.genre.join(',') : comicData.genre);
      formData.append('tags', Array.isArray(comicData.tags) ? comicData.tags.join(',') : comicData.tags);
      formData.append('publishType', monetizationData.mintAsNFT ? 'nft' : monetizationData.publishType);
      formData.append('status', 'draft');

      // Add NFT details if minting
      if (monetizationData.mintAsNFT) {
        const nftDetails = {
          mintStatus: 'pending',
          price: monetizationData.nftPrice || 0,
          maxSupply: monetizationData.nftCopies || 100,
          currentSupply: 0,
          royaltyPercentage: 10, // Default 10% royalty
        };
        formData.append('nftDetails', JSON.stringify(nftDetails));
      }

      // Debug: Log what we're sending
      console.log("📤 Sending to /api/comics/full:", {
        title: comicData.title,
        description: comicData.description,
        genre: comicData.genre,
        tags: comicData.tags,
        hasPages: formData.getAll('pages').length,
        hasCoverImage: formData.has('coverImage'),
        formDataEntries: Array.from(formData.keys()),
      });

      const token = localStorage.getItem('token');
      
      const response = await axios.post("http://localhost:5000/api/comics/full",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 70) / progressEvent.total);
              setUploadProgress(30 + progress);
            }
          },
        }
      );
      
      setUploadProgress(100);
      const createdComic = response.data.data.comic;
      const metadataCid = createdComic.nftMetadataCid;
      const dbComicId = createdComic._id;
      console.log("🆔 Created comic in DB with ID:", dbComicId);
      console.log("📝 Created comic with metadata CID:", metadataCid);
      console.log("📄 Full response data:", response.data);
      console.log("📄 Full created comic data:", createdComic);
      
      // Reset state
      setStatus("inscribing");
      setProgress(0);
      setError(null);
      inscriptionCompleted.current = false;
      lastValidProgress.current = 0;

      // const cidMetadata = {
      //   standard: "HIP412",
      //   version: "1.0.0",
      //   metadata_cid: `https://gateway.pinata.cloud/ipfs/${metadataCid}`,
      //   storage: "ipfs",
      //   description: "HIP412 metadata stored on IPFS",
      // };
      const cidMetadata = `https://gateway.pinata.cloud/ipfs/${metadataCid}`

      // ✨ Perform inscription
      // const inscriptionResult = await inscribeWithSigner(
      //   {
      //     type: "buffer",
      //     buffer: Buffer.from(JSON.stringify(cidMetadata), "utf-8"),
      //     fileName: `metadata-${Date.now()}.json`,
      //     mimeType: "application/json",
      //     // fileName: fileToInscribe.name,
      //     // mimeType: fileToInscribe.type || "application/zip",
      //   },
      //   signer,
      //   {
      //     mode: "hashinal-collection",
      //     metadata: cidMetadata,
      //     waitForConfirmation: true,
      //     waitMaxAttempts: 50,
      //     waitIntervalMs: 8000,
      //     chunkSize: 1024 * 256,
      //     network,
      //     progressCallback: (data: any) => {
      //       console.log("Progress update:", data);
      //       const pct = Math.min(data.progressPercent || 0, 95);
      //       setProgress(pct);
      //       setStatusText(data.message || "Inscribing...");
      //     },
      //   }
      // );
       const inscriptionResult = await inscribeWithSigner(
        {
          type: "url",
          url: cidMetadata,
        },
        signer,
        {
          // mode: "hashinal-collection",
          // jsonFileURL: cidMetadata,
         
          waitForConfirmation: true,
           metadata: {
            standard: "HIP412",
            version: "1.0.0",
            name: `Comic Metadata ${dbComicId}`,
            description: "HIP412 metadata stored on IPFS",
            storage: "ipfs",
            source: cidMetadata,
          },
          waitMaxAttempts: 50,
          waitIntervalMs: 8000,
          chunkSize: 1024 * 256,
          network,
          progressCallback: (data: any) => {
            console.log("Progress update:", data);
            const pct = Math.min(data.progressPercent || 0, 95);
            setProgress(pct);
            setStatusText(data.message || "Inscribing...");
          },
        }
      );


      console.log("📦 Inscription result:", inscriptionResult);

      const transactionId = (() => {
        // Prefer explicit inscription.transactionId
        const insTx = inscriptionResult?.inscription?.transactionId;
        if (insTx) return insTx;
        console.log('Inscription result:', insTx);
        // If result is a plain string, treat it as the transactionId
        if (typeof inscriptionResult?.result === "string") return inscriptionResult!.result;
        console.log('Inscription result object:', inscriptionResult?.result);
        // If result is an object that contains transactionId, use it
        if (inscriptionResult?.result && typeof inscriptionResult.result === "object") {
          if ("transactionId" in inscriptionResult.result) {
            return (inscriptionResult.result as any).transactionId;
            console.log('Found transactionId in result:', (inscriptionResult.result as any).transactionId);
          }
          // Some implementations may nest transactionId under result.transaction
          if ("transaction" in inscriptionResult.result && (inscriptionResult.result as any).transaction?.transactionId) {
            return (inscriptionResult.result as any).transaction.transactionId;
          }
        }
        return undefined;
      })();

      if (!transactionId) {
        console.error("No transaction ID found in result:", inscriptionResult);
        throw new Error("Failed to get inscription transaction ID");
      }

      console.log("✅ Transaction ID:", transactionId);

      // Try using the SDK's retrieve function first
      let retrieved = null;
      // let metadataTopicIds: string[] = [];
        
      // Second attempt: Use API directly with proper error handling
      try {
        const apiUrl = `https://v2-api.tier.bot/api/inscriptions/retrieve-inscription?id=${transactionId}&network=${network}`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'x-api-key': 'U2FsdGVkX1/9qgz+T40+LmPPW2lNisq2q/z8u6Nyc429UQvlmftvjEd7PGbapX9iHd/IM3mWQqTKmueh7QuIPg=='
          },
        });
        
        if (!response.ok) {
          console.error(`API returned ${response.status}: ${response.statusText}`);
        } else {
          retrieved = await response.json();
          console.log("📊 Retrieved via API:", retrieved);
          console.log("name of Com.name:", retrieved?.name);
}
        //   if (retrieved?.files?.metadataUploads) {
        //     metadataTopicIds = retrieved.files.metadataUploads
        //       .map((m: any) => m?.topicId)
        //       .filter(Boolean);
        //   } else if (retrieved?.metadataUploads) {
        //     metadataTopicIds = retrieved.metadataUploads
        //       .map((m: any) => m?.topicId)
        //       .filter(Boolean);
        //   }
        // }
      } catch (apiError) {
        console.error("API retrieve also failed:", apiError);
      }
      
      console.log("✅ Inscription Topic ID:", inscriptionResult?.inscription?.topic_id);
      // console.log("🧩 Metadata Topic IDs:",  metadataTopicIds);

      const inscriptionData = {
        jobId: inscriptionResult?.inscription?.jobId,
        transactionId,
        topicId: inscriptionResult?.inscription?.topic_id,
        // metadataTopicIds,
        result: retrieved || inscriptionResult,
        name: inscriptionResult?.inscription?.name || retrieved?.name,
      };
     console.log("📝 Final Inscription Data:", inscriptionData);
      setResult(inscriptionData);
      setStatus("done");
      setProgress(100);
      setStatusText("Inscription completed successfully!");

      return inscriptionData;
      
    } catch (err: any) {
      console.error("❌ Inscription error:", err);
      if (err.response) {
        console.error("📛 Server Response Status:", err.response.status);
        console.error("📛 Server Response Data:", err.response.data);
        console.error("📛 Server Response Headers:", err.response.headers);
      }
      console.error("📛 Error Message:", err.message);
      
      const errorMessage = err.response?.data?.message || err.message || "Unexpected error during inscription.";
      setError(errorMessage);
      setStatus("error");
      setStatusText(`Error: ${errorMessage}`);
    
      throw err;
    }
  };

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    setResult(null);
    setStatusText("");
    inscriptionCompleted.current = false;
    lastValidProgress.current = 0;
  };

  return { 
    createInscription, 
    status, 
    progress, 
    result, 
    error, 
    statusText,
    uploadProgress,
    reset,
  };

}

