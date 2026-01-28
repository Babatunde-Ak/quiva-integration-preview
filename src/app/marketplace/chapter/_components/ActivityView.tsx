import React from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

const ActivityView = () => {
  // Mock Data matching the screenshot
  const activityData = [
    { id: 1, event: "Sold", item: "/dev_images/avatar-2.png", price: "465.45", qty: "1", from: "Quiva", to: "DevSenpia", time: "21s ago" },
    { id: 2, event: "Sold", item: "/dev_images/avatar-2.png", price: "465.45", qty: "1", from: "Cody", to: "DevSenpia", time: "21s ago" },
    { id: 3, event: "Sold", item: "/dev_images/avatar-2.png", price: "465.45", qty: "1", from: "Quiva", to: "Dunny", time: "21s ago" },
    { id: 4, event: "Sold", item: "/dev_images/avatar-2.png", price: "465.45", qty: "1", from: "Cody", to: "DevSenpia", time: "21s ago" },
    { id: 5, event: "Sold", item: "/dev_images/avatar-2.png", price: "465.45", qty: "1", from: "Quiva", to: "Dunny", time: "21s ago" },
    { id: 6, event: "Sold", item: "/dev_images/avatar-2.png", price: "465.45", qty: "1", from: "Quiva", to: "DevSenpia", time: "21s ago" },
    { id: 7, event: "Sold", item: "/dev_images/avatar-2.png", price: "465.45", qty: "1", from: "Cody", to: "DevSenpia", time: "21s ago" },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-white">Activity</h3> {/* Adjusted title for context */}
        
        {/* Filter Button */}
        <button className="flex items-center gap-2 bg-[#0A0A0A] border border-[#242424] rounded-full px-4 py-2 text-sm font-medium hover:border-gray-600 transition-all text-white active:scale-95">
          Mint
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Table Container - Horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-[#242424]">
              <th className="text-left py-4 text-sm font-medium text-white pl-4">Event</th>
              <th className="text-left py-4 text-sm font-medium text-white">Item</th>
              <th className="text-left py-4 text-sm font-medium text-white">Price</th>
              <th className="text-left py-4 text-sm font-medium text-white">Qty</th>
              <th className="text-left py-4 text-sm font-medium text-white">From</th>
              <th className="text-left py-4 text-sm font-medium text-white">To</th>
              <th className="text-right py-4 text-sm font-medium text-white pr-4">Time</th>
            </tr>
          </thead>
          <tbody>
            {activityData.map((row, idx) => (
              <tr key={idx} className="border-b border-[#242424] hover:bg-white/5 transition-colors group">
                
                {/* Event */}
                <td className="py-4 pl-4 text-sm font-bold text-white">
                  {row.event}
                </td>

                {/* Item Thumbnail */}
                <td className="py-4">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border border-[#242424]">
                    <Image src={row.item} alt="Item" fill className="object-cover" />
                  </div>
                </td>

                {/* Price */}
                <td className="py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{row.price}</span>
                    <span className="flex items-center justify-center w-8 h-8 rounded">
                        <Image src="/hbar.png" alt="H" width={20} height={20} />
                    </span>
                  </div>
                </td>

                {/* Qty */}
                <td className="py-4 text-sm font-bold text-white">
                  {row.qty}
                </td>

                {/* From User */}
                <td className="py-4 text-sm font-bold text-white hover:text-orange-500 cursor-pointer transition-colors">
                  {row.from}
                </td>

                {/* To User */}
                <td className="py-4 text-sm font-bold text-white hover:text-orange-500 cursor-pointer transition-colors">
                  {row.to}
                </td>

                {/* Time */}
                <td className="py-4 pr-4 text-right text-sm font-bold text-white">
                  {row.time}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityView;