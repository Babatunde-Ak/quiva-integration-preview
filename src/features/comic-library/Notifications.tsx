import React from "react";
import { Rocket, ChevronRight, Bell } from "lucide-react";

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
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Bell className="h-10 w-10 text-white/20 mb-4" />
            <p className="text-white/40 text-sm">No notifications yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
