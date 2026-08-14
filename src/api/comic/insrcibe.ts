// import { NextRequest, NextResponse } from 'next/server';
// import { inscribe } from "@hashgraphonline/standards-sdk";

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file') as File;
//     const metadata = formData.get('metadata') ? 
//       JSON.parse(formData.get('metadata') as string) : undefined;
//     const mode = formData.get('mode') as string || 'hashinal';
    
//     if (!file) {
//       return NextResponse.json({ 
//         success: false, 
//         error: 'No file provided' 
//       }, { status: 400 });
//     }

//     const arrayBuffer = await file.arrayBuffer();
    
//     // For server-side inscription, you'll need a server signer
//     // This is a placeholder - implement based on your needs
//     const serverSigner = getServerSigner(); // Implement this based on your setup
    
//     const res = await inscribe(
//       {
//         type: "buffer",
//         buffer: arrayBuffer,
//         fileName: file.name,
//         mimeType: file.type || "image/png",
//       },
//       serverSigner,
//       {
//         mode,
//         metadata,
//         waitForConfirmation: true,
//       }
//     );

//     const uri = `hcs://1/${res.inscription.topic_id}`;
//     const metadataUri = metadata ? `hcs://1/${res.inscription.jsonTopicId}` : undefined;

//     return NextResponse.json({
//       success: true,
//       uri,
//       metadataUri,
//       inscription: res.inscription,
//     });
//   } catch (error: any) {
//     console.error('Error inscribing:', error);
//     return NextResponse.json({ 
//       success: false, 
//       error: error.message 
//     }, { status: 500 });
//   }
// }

// // Placeholder - implement based on your server signing strategy
// function getServerSigner() {
//   // Option 1: Use a server-controlled account for inscriptions
//   // Option 2: Pass through user signatures
//   // This depends on your architecture
//   throw new Error("Server signer not implemented");
// }