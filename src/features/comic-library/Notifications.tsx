import React from "react";
import { Rocket, ChevronRight } from "lucide-react";

interface NotificationItem {
  id: number;
  avatarUrl: string;
  content: React.ReactNode;
  timestamp: string;
  isNew?: boolean;
}

// Mock Data
const notificationsData: NotificationItem[] = [
  {
    id: 1,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brian",
    content: (
      <span>
        <span className="text-white font-bold">Brian Griffin</span> wants to
        collaborate
      </span>
    ),
    timestamp: "5 days ago",
  },
  {
    id: 2,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mayor",
    content:
      "Hey Mary, we've got a new buyer for your comic collection. Eagle eyes from The Mayor's Collection has been viewed by 50 people.",
    timestamp: "1 month ago",
  },
  {
    id: 3,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mort",
    content:
      "Hey Mary, we've got a new buyer for your comic collection. Eagle eyes from The Mayor's Collection has been viewed by 50 people.",
    timestamp: "1 month ago",
  },
  {
    id: 4,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Peter",
    content:
      "Hey Mary, we've got a new buyer for your comic collection. Eagle eyes from The Mayor's Collection has been viewed by 50 people.",
    timestamp: "1 month ago",
  },
  {
    id: 5,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Herbert",
    content:
      "Hey Mary, we've got a new buyer for your comic collection. Eagle eyes from The Mayor's Collection has been viewed by 50 people.",
    timestamp: "1 month ago",
  },
  {
    id: 6,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cleveland",
    content:
      "Hey Mary, we've got a new buyer for your comic collection. Eagle eyes from The Mayor's Collection has been viewed by 50 people.",
    timestamp: "1 month ago",
  },
  {
    id: 7,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joe",
    content:
      "Hey Mary, we've got a new buyer for your comic collection. Eagle eyes from The Mayor's Collection has been viewed by 50 people.",
    timestamp: "1 month ago",
  },
  {
    id: 8,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Stewie",
    content:
      "Hey Mary, we've got a new buyer for your comic collection. Eagle eyes from The Mayor's Collection has been viewed by 50 people.",
    timestamp: "1 month ago",
  },
];

const Notifications = () => {
  return (
    <div className="min-h-screen bg-black text-gray-300 font-mono p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Notifications
        </h1>

        {/* Feature Banner */}
        <div className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-[#D97736] to-[#A05E23] p-4 transition-all hover:brightness-110 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Rocket className="h-5 w-5 text-white fill-white" />
              </div>
              <div className="flex flex-col text-sm text-white md:text-base">
                <span className="font-bold">We released some new features</span>
                <span className="opacity-90">Check them out!</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white opacity-80" />
          </div>
        </div>

        {/* Notification List Container */}
        <div className="rounded-xl border border-orange-500/40 bg-black/50">
          <div className="divide-y divide-gray-800">
            {notificationsData.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-5 hover:bg-gray-900/30 transition-colors"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={item.avatarUrl}
                    alt="User avatar"
                    className="h-10 w-10 rounded-full bg-gray-700 object-cover ring-2 ring-gray-800"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1">
                  <p className="text-sm leading-relaxed text-white/70">
                    {item.content}
                  </p>
                  <span className="text-xs font-medium text-white/70">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
