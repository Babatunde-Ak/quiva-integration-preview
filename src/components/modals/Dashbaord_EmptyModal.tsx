"use client";
import React from "react";
import Image from "next/image";
import { ChevronDown, Bell } from "lucide-react";
import { motion } from "framer-motion";

const Dashbaord_EmptyModal = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-[#111] text-white flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sidebar */}
      <aside className="w-60 bg-[#1a1a1a] flex flex-col justify-between py-6 px-4 border-r border-gray-800">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <Image
              src="/quiva.png"
              alt="Quiva Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-semibold text-lg">Quiva</span>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-3">
            <button className="text-sm text-white text-left hover:text-yellow-400 transition-colors duration-200">
              Home
            </button>
            <button className="text-sm text-white text-left hover:text-yellow-400 transition-colors duration-200">
              My Comics
            </button>
            <button className="text-sm text-white text-left hover:text-yellow-400 transition-colors duration-200">
              Earnings
            </button>
            <button className="text-sm bg-yellow-500 text-black px-3 py-2 rounded-lg font-medium text-left hover:bg-yellow-400 transition duration-200">
              Create New Comic
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold">Welcome Mary!</h1>

          <div className="flex items-center gap-6">
            {/* Notification */}
            <button className="relative text-gray-400 hover:text-white transition">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
            </button>

            {/* User avatar + dropdown */}
            <div className="flex items-center gap-2 cursor-pointer group">
              <Image
                src="/user-avatar.png"
                alt="User Avatar"
                width={36}
                height={36}
                className="rounded-full"
              />
              <ChevronDown
                size={16}
                className="text-gray-400 group-hover:text-white transition"
              />
            </div>
          </div>
        </div>

        {/* Create box */}
        <motion.div
          className="bg-[#1f1f1f] border border-gray-700 rounded-xl p-8 text-center mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-6">Start a new comic fast</h2>
          <div className="grid grid-cols-2 gap-6">
            {/* New Comic */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#2a2a2a] rounded-xl p-6 hover:bg-[#333] cursor-pointer transition"
            >
              <Image
                src="/icons/new-comic.png"
                alt="New Comic"
                width={40}
                height={40}
                className="mx-auto mb-4"
              />
              <h3 className="font-medium">Create New Comic</h3>
              <p className="text-sm text-gray-400 mt-2">
                Start from scratch with fresh tools
              </p>
            </motion.div>

            {/* Upload Comic */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#2a2a2a] rounded-xl p-6 hover:bg-[#333] cursor-pointer transition"
            >
              <Image
                src="/icons/upload.png"
                alt="Upload Comic"
                width={40}
                height={40}
                className="mx-auto mb-4"
              />
              <h3 className="font-medium">Upload Comic Files</h3>
              <p className="text-sm text-gray-400 mt-2">
                Bring your existing work into Quiva
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-3">Recent</h2>

          {/* Dropdown under "Recent" */}
          <div className="mb-6">
            <label htmlFor="sort" className="block text-sm text-gray-400 mb-1">
              Sort by
            </label>
            <select
              id="sort"
              className="bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 w-48"
            >
              <option value="date">Date</option>
              <option value="size">Size</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Empty state */}
          <div className="text-gray-500 text-sm">No recent comics yet.</div>
        </motion.section>
      </main>
    </motion.div>
  );
};

export default Dashbaord_EmptyModal;
