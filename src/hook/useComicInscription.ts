import { useState } from "react";

interface UseComicInscriptionProps {
  accountId?: string;
  signer?: any;
  network?: "testnet" | "mainnet";
}

export function useComicInscription(_props: UseComicInscriptionProps = {}) {
  const [status] = useState<"idle" | "inscribing" | "done" | "error">("idle");
  const [progress] = useState(0);
  const [result] = useState<any>(null);
  const [error] = useState<string | null>(null);
  const [uploadProgress] = useState(0);

  return {
    createInscription: async (metadataCid: string, dbComicId: string) => ({
      transactionId: "",
      topicId: "",
      dbComicId,
      metadataCid,
      result: {},
      status: "skipped",
    }),
    status,
    progress,
    result,
    error,
    uploadProgress,
  };
}

export default useComicInscription;

// import { useRef, useState } from "react";
// import { inscribeWithSigner, retrieveInscription } from "@hashgraphonline/standards-sdk";
// import { Buffer } from "buffer";
// import axiosInstance from "@/redux/axios-instance";
// import axios from "axios";

// interface UseComicInscriptionProps {
//   accountId: string;
//   signer: any;
//   network?: "testnet" | "mainnet";
// }

// interface InscriptionFormData {
//   zipFile?: File;
//   pdfFile?: File;
//   imageFiles?: File[];  // Support for individual image files
//   description?: string;
// }

// // interface ComicData {
// //   title: string;
// //   description: string;
// //   genre: string[];
// //   tags: string[];
// //   ageRating: string;
// //   coverImage: File | null;
// //   pages: any[];
// // }
// interface ComicPageFile extends File {
//   customType?: string; // 'zip-images' | 'pdf-file' | undefined
//   // Add any other custom properties if needed
// }

// interface ComicData {
//    title: string,
//     episodeNumber: string,
//     summary: string,
//     maturityRating: string,
//     bannerImage: File | null,
//     collaborators: string[],
//     contentType: 'pdf' | 'images' | null,
//     files: ComicPageFile[]
// }

// interface MonetizationData {
//   publishType: 'free' | 'paid';
//   price?: number;
//   mintAsNFT: boolean;
//   nftCopies?: number;
//   nftPrice?: number;
// }

// export function useComicInscription({
//   accountId,
//   signer,
//   network = "testnet",
//   // collectionId
// }: UseComicInscriptionProps) {
//   const [status, setStatus] = useState<"idle" | "inscribing" | "done" | "error">("idle");
//   const [progress, setProgress] = useState<number>(0);
//   const [error, setError] = useState<string | null>(null);
//   const [result, setResult] = useState<any>(null);
//   const [statusText, setStatusText] = useState<string>("");
//   const [uploadProgress, setUploadProgress] = useState<number>(0);
//   const inscriptionCompleted = useRef(false);
//   const lastValidProgress = useRef(0);

//   const createInscription = async (metadataCid: string, dbComicId: string) => {
//     try {
//       if (!signer || typeof signer.sign !== "function") {
//         throw new Error("No valid signer. Please connect your wallet.");
//       }
      
//       // Reset state
//       setStatus("inscribing");
//       setProgress(0);
//       setError(null);
//       inscriptionCompleted.current = false;
//       lastValidProgress.current = 0;

      
//       const cidMetadata = `https://gateway.pinata.cloud/ipfs/${metadataCid}`

     
//       console.log("🚀 Starting inscription with metadata CID:", cidMetadata);
//        const inscriptionResult = await inscribeWithSigner(
//         {
//           type: "url",
//           url: cidMetadata,
//         },
//         signer,
//         {
         
//           waitForConfirmation: true,
//            metadata: {
//             standard: "HIP412",
//             version: "1.0.0",
//             name: `Comic Metadata ${dbComicId}`,
//             description: "HIP412 metadata stored on IPFS",
//             storage: "ipfs",
//             source: cidMetadata,
//           },
//           waitMaxAttempts: 50,
//           waitIntervalMs: 8000,
//           chunkSize: 1024 * 256,
//           network,
//           progressCallback: (data: any) => {
//             console.log("Progress update:", data);
//             const pct = Math.min(data.progressPercent || 0, 95);
//             setProgress(pct);
//             setStatusText(data.message || "Inscribing...");
//           },
//         }
//       );


//       console.log("📦 Inscription result:", inscriptionResult);

//       const transactionId = (() => {
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

//       if (!transactionId) {
//         console.error("No transaction ID found in result:", inscriptionResult);
//         throw new Error("Failed to get inscription transaction ID");
//       }

//       console.log("✅ Transaction ID:", transactionId);

//       // Try using the SDK's retrieve function first
//       let retrieved = null;
//       // let metadataTopicIds: string[] = [];
        
//       // Second attempt: Use API directly with proper error handling
//       try {
//         const apiUrl = `https://v2-api.tier.bot/api/inscriptions/retrieve-inscription?id=${transactionId}&network=${network}`;
        
//         const response = await fetch(apiUrl, {
//           method: 'GET',
//           headers: {
//             'Accept': 'application/json',
//             'x-api-key': 'U2FsdGVkX1/9qgz+T40+LmPPW2lNisq2q/z8u6Nyc429UQvlmftvjEd7PGbapX9iHd/IM3mWQqTKmueh7QuIPg=='
//           },
//         });
        
//         if (!response.ok) {
//           console.error(`API returned ${response.status}: ${response.statusText}`);
//         } else {
//           retrieved = await response.json();
//           console.log("📊 Retrieved via API:", retrieved);
//           console.log("name of Com.name:", retrieved?.name);
// }
        
//       } catch (apiError) {
//         console.error("API retrieve also failed:", apiError);
//       }
      
//       console.log("✅ Inscription Topic ID:", inscriptionResult?.inscription?.topic_id);
//       // console.log("🧩 Metadata Topic IDs:",  metadataTopicIds);

//       const inscriptionData = {
//         jobId: inscriptionResult?.inscription?.jobId,
//         transactionId,
//         topicId: inscriptionResult?.inscription?.topic_id,
//         dbComicId,
//         result: retrieved || inscriptionResult,
//         name: inscriptionResult?.inscription?.name || retrieved?.name,
//       };
//      console.log("📝 Final Inscription Data:", inscriptionData);
//       setResult(inscriptionData);
//       setStatus("done");
//       setProgress(100);
//       setStatusText("Inscription completed successfully!");

//       return inscriptionData;
      
//     } catch (err: any) {
//       console.error("❌ Inscription error:", err);
//       if (err.response) {
//         console.error("📛 Server Response Status:", err.response.status);
//         console.error("📛 Server Response Data:", err.response.data);
//         console.error("📛 Server Response Headers:", err.response.headers);
//       }
//       console.error("📛 Error Message:", err.message);
      
//       const errorMessage = err.response?.data?.message || err.message || "Unexpected error during inscription.";
//       setError(errorMessage);
//       setStatus("error");
//       setStatusText(`Error: ${errorMessage}`);
    
//       throw err;
//     }
//   };

//   const reset = () => {
//     setStatus("idle");
//     setProgress(0);
//     setError(null);
//     setResult(null);
//     setStatusText("");
//     inscriptionCompleted.current = false;
//     lastValidProgress.current = 0;
//   };

//   return { 
//     createInscription, 
//     status, 
//     progress, 
//     result, 
//     error, 
//     statusText,
//     uploadProgress,
//     reset,
//   };

// }

