"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MainButton } from "@/components/button";
import { Bell, Search, Plus, Book, PenTool, Wallet, Settings, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { logout } from "@/redux/slices/authSlice";

const DashboardPage = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();

	const user = useAppSelector((s) => s.auth?.user?.data);
	const walletAddress = useAppSelector(
		(s) => s.auth?.user?.data?.walletAddress ?? s.wallet?.walletAddress ?? null
	);

	const [activeTab, setActiveTab] = useState<"reader" | "creator">("reader");

	const displayName = user?.displayName ?? user?.username ?? user?.email ?? "there";
	const avatarSrc = user?.avatar ?? null;
	const shortWallet = walletAddress
		? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
		: null;

	const handleLogout = () => {
		dispatch(logout());
		router.push("/");
	};

	const handleBecomeCreator = () => {
		router.push("/auth/creator-onboarding");
	};

	return (
		<div className="min-h-screen bg-black text-white">
			{/* Header */}
			<header className="border-b border-white/10 px-4 py-3">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					{/* Logo */}
					<Link href="/">
						<Image
							src="/logo.png"
							alt="Quiva Logo"
							width={100}
							height={40}
							className="cursor-pointer"
						/>
					</Link>

					{/* Search Bar */}
					<div className="flex-1 max-w-md mx-8">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
							<input
								type="text"
								placeholder="Search comics, creators..."
								className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-yellow-500"
							/>
						</div>
					</div>

					{/* User Actions */}
					<div className="flex items-center gap-4">
						<button className="relative text-white/70 hover:text-white transition">
							<Bell size={20} />
							<span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
						</button>

						{shortWallet && (
							<div className="flex items-center gap-2 text-white/70">
								<Wallet size={20} />
								<span className="text-sm font-mono">{shortWallet}</span>
							</div>
						)}

						{/* User Avatar + Dropdown */}
						<div className="relative group">
							<button className="flex items-center gap-2">
								{avatarSrc ? (
									<Image
										src={avatarSrc}
										alt={displayName}
										width={32}
										height={32}
										className="rounded-full object-cover"
									/>
								) : (
									<div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-500 text-sm font-bold">
										{displayName.slice(0, 1).toUpperCase()}
									</div>
								)}
							</button>

							{/* Dropdown Menu */}
							<div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-white/20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
								<div className="px-3 py-2 border-b border-white/10">
									<p className="text-sm font-semibold text-white truncate">{displayName}</p>
									{shortWallet && (
										<p className="text-xs text-white/50 font-mono truncate">{shortWallet}</p>
									)}
								</div>
								<div className="p-2 space-y-1">
									<button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/10 rounded text-sm">
										<Settings size={16} />
										Settings
									</button>
									<button
										onClick={handleLogout}
										className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/10 rounded text-red-400 text-sm"
									>
										<LogOut size={16} />
										Logout
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 py-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">
						Welcome back{displayName !== "there" ? `, ${displayName}` : ""}!
					</h1>
					<p className="text-white/70">Ready to dive into some amazing stories?</p>
				</div>

				{/* Tab Navigation */}
				<div className="flex gap-6 mb-8 border-b border-white/10">
					<button
						onClick={() => setActiveTab("reader")}
						className={`pb-4 px-2 border-b-2 transition ${
							activeTab === "reader"
								? "border-yellow-500 text-yellow-500"
								: "border-transparent text-white/70 hover:text-white"
						}`}
					>
						Reader Dashboard
					</button>
					<button
						onClick={() => setActiveTab("creator")}
						className={`pb-4 px-2 border-b-2 transition ${
							activeTab === "creator"
								? "border-yellow-500 text-yellow-500"
								: "border-transparent text-white/70 hover:text-white"
						}`}
					>
						Creator Dashboard
					</button>
				</div>

				{/* Reader Dashboard */}
				{activeTab === "reader" && (
					<div className="space-y-8">
						{/* Quick Actions */}
						<div className="flex gap-4">
							<Link href="/marketplace">
								<MainButton className="flex items-center gap-2">
									<Search size={18} />
									Browse Marketplace
								</MainButton>
							</Link>
							{user?.role !== "Creator" && (
								<button
									onClick={handleBecomeCreator}
									className="flex items-center gap-2 px-6 py-3 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition"
								>
									<PenTool size={18} />
									Become a Creator
								</button>
							)}
						</div>

						{/* Continue Reading placeholder */}
						<div>
							<h2 className="text-xl font-bold mb-4">Continue Reading</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-yellow-500/50 transition cursor-pointer">
										<div className="aspect-[3/4] bg-gradient-to-br from-yellow-500/20 to-purple-500/20" />
										<div className="p-4">
											<h3 className="font-semibold mb-1">Comic Title {i}</h3>
											<p className="text-white/70 text-sm">Chapter 12</p>
											<div className="w-full bg-white/10 rounded-full h-2 mt-2">
												<div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${25 * i}%` }} />
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Creator Dashboard */}
				{activeTab === "creator" && (
					<div className="space-y-8">
						<div className="text-center py-12 bg-gradient-to-br from-yellow-500/10 to-purple-500/10 border border-white/10 rounded-lg">
							<PenTool className="mx-auto mb-4 text-yellow-500" size={48} />
							<h2 className="text-2xl font-bold mb-4">Ready to Create?</h2>
							<p className="text-white/70 mb-6 max-w-md mx-auto">
								Join thousands of creators sharing their stories and earning from their passion.
							</p>
							<div className="flex gap-4 justify-center">
								<button
									onClick={handleBecomeCreator}
									className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-semibold"
								>
									<Plus size={18} />
									Start Creating
								</button>
								<Link href="/comic-pad">
									<button className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition">
										<Book size={18} />
										ComicPad
									</button>
								</Link>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default DashboardPage;
