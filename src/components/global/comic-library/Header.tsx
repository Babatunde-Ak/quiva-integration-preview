"use client";

import { Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { QuivaLogo } from "@/components/utils/function";
// import { RainbowConnect } from "@/components/button/RainbowConnect";
// import HashConnectButton from "@/components/button/HashConnectButton";
import ComicConnect from "./ComicConnect";
import { SearchBar } from "@/components/search/SearchBar";

export function Header({ onMobileMenuToggle, isMobileMenuOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotifications]);

  return (
    <header className="bg-black-200 border-b border-dashed border-white/30 w-full relative z-50">
      <div className="px-4 lg:px-6 py-3 ">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center space-x-3 lg:hidden">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-black-300"
              onClick={onMobileMenuToggle}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            {/* Logo - Mobile Only */}
            <div className="lg:hidden">
              <QuivaLogo showText className="invert" />
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar
              placeholder="Search comics, creators..."
              className="w-full"
            />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 lg:space-x-3">

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-black-300 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Notification Dropdown - FIXED: Better positioning */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-black-200 border border-white/70 rounded-lg shadow-xl z-[60] transform translate-z-0">
                  <div className="p-4 border-b border-white/70 flex justify-between items-center">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs text-white/60 hover:text-white hover:bg-black-300"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-white/40">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-black-300 hover:bg-black-300 cursor-pointer transition-colors ${
                            !notification.read ? "bg-black-300/50" : ""
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <p
                              className={`text-sm ${
                                notification.read
                                  ? "text-white/40"
                                  : "text-white"
                              }`}
                            >
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-white/50 mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {/* <HashConnectButton />
              <RainbowConnect /> */}
              <ComicConnect/>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3">
          <SearchBar
            placeholder="Search comics, creators..."
            className="w-full"
          />
        </div>
      </div>
    </header>
  );
}
