import React from 'react';
import Image from 'next/image';
import { Search, ChevronDown, PrinterCheckIcon } from 'lucide-react';
import  useComicPlatform  from '@/hook/useMarkeplace';
import { useHederaWallet } from '@/providers/HashPackProvider'
import { useAppSelector } from '@/redux/hook'
import {  approveNFTForMarketplace, setApprovalForAllHTS } from '@/hook/ApproveAssociate';
import { canAuthorizeHTSTransfer } from '@/hook/useCheckAccountType';
 

const ComicsView = () => {
  const comics = [
    { id: 1, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00", image: "/dev_images/avatar-2.png" },
    { id: 2, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00", image: "/dev_images/avatar-2.png" },
    { id: 3, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00", image: "/dev_images/avatar-2.png" },
    { id: 4, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00", image: "/dev_images/avatar-2.png" },
    { id: 5, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00", image: "/dev_images/avatar-2.png" },
    { id: 6, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00", image: "/dev_images/avatar-2.png" },
  ];

  const { 
            account,
            signer,
         
        } = useHederaWallet();
    
  const { user } = useAppSelector((state:any) => state.wallet);

  const { purchaseFromListing, listForResale, getDirectListing, purchaseFromMarketplace, getMarketplaceListing } = useComicPlatform({
          accountId: account || user?.walletAddress || '',
          network: "testnet",
          signer: signer,

  });

//   export async function getHederaAccountInfo(accountId: string) {
//   const res = await fetch(
//     `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${accountId}`
//   );

//   if (!res.ok) {
//     throw new Error("Failed to fetch account info");
//   }

//   return res.json();
// }


const handlePurchase = async () => {
 try {
      // const currentListing =  await getDirectListing(0);
      // console.log('Current Listing:', currentListing);
  // const result = await purchaseFromListing({
  //   listingId: 1,
  //   quantity: 2,
  //   pricePerNFT: 20
  // });
  //  const approveResult = await setApprovalForAllHTS(
  //    '0.0.7813755',
  //    '0.0.7806693',
  //     account || user?.walletAddress || '',
  //     signer,
  //      [1]
  //  )

  // const approveResult = await approveNFTForMarketplace(
  //   '0.0.7813755',
  //   [1],
  //   '0.0.7806693',
  //   account || user?.walletAddress || '',
  //   signer,
  //   "testnet"

  // )

  //  console.log('Approve Result:', approveResult);

  // const result = await listForResale({
  //   tokenAddress: '0.0.7813755',
  //   serialNumber: 1,
  //   priceInHbar: 50
  // })
  // const getListing = await getMarketplaceListing(0);
  // console.log('Get Listing Result:', getListing);

  
// const canBuy = await canAuthorizeHTSTransfer(user?.walletAddress || '');

// if (!canBuy) {
//   throw new Error(
//     "This wallet cannot authorize NFT transfers on Hedera. Please use an EVM-compatible (ECDSA) account."
//   );
// }
  const result = await purchaseFromMarketplace({
    listingId: 0,
    priceInHbar: 50
  })
  // console.log('Purchase Result:', result);
   console.log('DepositList Result:', result);
 } catch (error) {
  console.error('Purchase failed:', error);
  
 }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header / Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h3 className="text-xl font-bold">200 Minted Comics</h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative group w-full md:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search title, chapter" 
              className="bg-[#0A0A0A] placeholder:text-gray-500 border border-[#242424] rounded-full pl-10 pr-4 py-2.5 text-sm text-white w-full md:w-64 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
            />
          </div>

          {/* Filter Btn */}
          <button className="flex items-center justify-center gap-2 bg-[#0A0A0A] border border-[#242424] rounded-full px-4 py-2.5 text-sm font-medium hover:border-gray-600 hover:bg-gray-800 active:scale-95 transition-all w-full sm:w-auto">
            Price low to high
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {comics.map((comic) => (
          <div key={comic.id} className="bg-[#0A0A0A] rounded-2xl p-4 border border-[#242424] hover:border-orange-500/30 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer">
            <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-900">
              <Image src={comic.image} alt={comic.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 pointer-events-none" />
            </div>
            
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-bold text-lg group-hover:text-orange-400 transition-colors">{comic.title}</h4>
              <div className="flex items-center gap-1 text-[10px] bg-[#1A1A1A] px-2 py-1 rounded border border-gray-800 group-hover:border-orange-500/30 transition-colors">
                <span>Live</span>
                <span className="text-orange-500 animate-pulse">🔥</span>
              </div>
            </div>

            <div className="flex gap-8 mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
              <div><p className="text-[10px] text-gray-500 font-bold mb-0.5">Edition Supply</p><p className="text-xs font-bold text-white">{comic.supply}</p></div>
              <div><p className="text-[10px] text-gray-500 font-bold mb-0.5">Minted</p><p className="text-xs font-bold text-white">{comic.minted}</p></div>
            </div>

            <button className="w-full bg-[#FF9F1C] hover:bg-[#FFB045] active:scale-[0.98] text-black font-bold py-3 rounded-full flex items-center justify-center gap-1 transition-all duration-200 shadow-md"
                onClick={handlePurchase}
              >
              {comic.price} <Image src="/hbar.png" alt="HBAR" width={16} height={16}
              />
             
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComicsView;