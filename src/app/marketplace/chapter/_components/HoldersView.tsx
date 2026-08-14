import React from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

const HoldersView = () => {
  // Mock Data for Holders
  const holdersData = [
    { id: 1, wallet: "0xA31D...92Fe", items: ["/dev_images/avatar-2.png", "/dev_images/avatar-2.png", "/dev_images/avatar-2.png"], count: "3 editions", pct: "0.42%", val: "300k" },
    { id: 2, wallet: "0xB42E...81Aa", items: ["/dev_images/avatar-2.png", "/dev_images/avatar-2.png", "/dev_images/avatar-2.png"], count: "3 editions", pct: "0.42%", val: "300k" },
    { id: 3, wallet: "0xC53F...70Bb", items: ["/dev_images/avatar-2.png", "/dev_images/avatar-2.png", "/dev_images/avatar-2.png"], count: "3 editions", pct: "0.42%", val: "300k" },
    { id: 4, wallet: "0xD64G...69Cc", items: ["/dev_images/avatar-2.png", "/dev_images/avatar-2.png", "/dev_images/avatar-2.png"], count: "3 editions", pct: "0.42%", val: "300k" },
    { id: 5, wallet: "0xE75H...58Dd", items: ["/dev_images/avatar-2.png", "/dev_images/avatar-2.png", "/dev_images/avatar-2.png"], count: "3 editions", pct: "0.42%", val: "300k" },
    { id: 6, wallet: "0xF86I...47Ee", items: ["/dev_images/avatar-2.png", "/dev_images/avatar-2.png", "/dev_images/avatar-2.png"], count: "3 editions", pct: "0.42%", val: "300k" },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-white">2,000 Holders</h3>
        <button className="flex items-center gap-2 bg-[#0A0A0A] border border-[#242424] rounded-full px-4 py-2 text-sm font-medium hover:border-gray-600 transition-all text-white">
          Most Owned
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Table Container - Horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-[#242424]">
              <th className="text-left py-4 text-sm font-medium text-white pl-2">Wallet</th>
              <th className="text-left py-4 text-sm font-medium text-white">Item Owned</th>
              <th className="text-left py-4 text-sm font-medium text-white">Percentage Held</th>
              <th className="text-right py-4 text-sm font-medium text-white pr-2">Est. Value</th>
            </tr>
          </thead>
          <tbody>
            {holdersData.map((holder) => (
              <tr key={holder.id} className="border-b border-[#242424] hover:bg-white/5 transition-colors group">
                
                {/* Wallet Column */}
                <td className="py-4 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-red-600 p-[2px]">
                      <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-black">
                         <Image src="/dev_images/avatar-2.png" alt="Avatar" fill className="object-cover" />
                      </div>
                    </div>
                    <span className="font-bold text-sm text-gray-200 font-mono group-hover:text-white transition-colors">{holder.wallet}</span>
                  </div>
                </td>

                {/* Items Owned Column (Overlapping Images) */}
                <td className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {holder.items.map((src, i) => (
                        <div key={i} className="relative w-8 h-8 rounded-full border-2 border-[#151515] overflow-hidden">
                          <Image src={src} alt="item" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-white">{holder.count}</span>
                  </div>
                </td>

                {/* Percentage Column */}
                <td className="py-4">
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white">{holder.pct}</span>
                </td>

                {/* Value Column */}
                <td className="py-4 pr-2 text-right">
                  <span className="text-sm font-bold text-white flex items-center justify-end gap-1">
                    {holder.val}
                    <span className="flex items-center justify-center w-8 h-8 rounded">
                        <Image src="/hbar.png" alt="H" width={20} height={20} />
                    </span>
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

export default HoldersView;