import React from 'react';
import Image from 'next/image';

const OffersView = () => {
  // Mock Data matching the screenshot
  const offersData = Array(7).fill({
    id: 1,
    bidders: ["/dev_images/avatar-2.png", "/dev_images/avatar-2.png"], // Replace with your avatars
    bidderCount: 2,
    amount: "465.45",
    itemImage: "/dev_images/avatar-2.png", // Replace with item thumbnail
    expiry: "02:14:08:12"
  });

  return (
    <div className="animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-bold text-white">500 Offers</h3>
        <div className="text-sm text-white flex items-center gap-2">
          <span>Total collection Offers 5,000,576.957</span>
          <span className="flex items-center justify-center w-8 h-8 rounded">
            <Image src="/hbar.png" alt="H" width={20} height={20} />
          </span>
        </div>
      </div>

      {/* Table Container - Horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-[#242424]">
              <th className="text-left py-4 text-sm font-medium text-white pl-4">Bidders</th>
              <th className="text-left py-4 text-sm font-medium text-white">Amount</th>
              <th className="text-center py-4 text-sm font-medium text-white">Item</th>
              <th className="text-right py-4 text-sm font-medium text-white pr-4">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {offersData.map((offer, idx) => (
              <tr key={idx} className="border-b border-[#242424] hover:bg-white/5 transition-colors group">
                
                {/* Bidders Column */}
                <td className="py-4 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {offer.bidders.map((src: string, i: number) => (
                        <div key={i} className="relative w-10 h-10 rounded-full border-2 border-[#151515] overflow-hidden">
                          <Image src={src} alt="Bidder" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-white">{offer.bidderCount}</span>
                  </div>
                </td>

                {/* Amount Column */}
                <td className="py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{offer.amount}</span>
                    <span className="flex items-center justify-center w-8 h-8 rounded">
                        <Image src="/hbar.png" alt="H" width={20} height={20} />
                    </span>
                  </div>
                </td>

                {/* Item Column */}
                <td className="py-4 text-center">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden mx-auto border border-[#242424]">
                    <Image src={offer.itemImage} alt="Item" fill className="object-cover" />
                  </div>
                </td>

                {/* Expiry Column */}
                <td className="py-4 pr-4 text-right">
                  <span className="text-sm font-bold text-white font-mono tracking-wide">
                    {offer.expiry}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OffersView;