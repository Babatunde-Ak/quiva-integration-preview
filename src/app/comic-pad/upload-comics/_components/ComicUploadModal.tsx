"use client";
import { useState, useEffect } from "react";
import { X, Pause } from "lucide-react";

interface ComicUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;   // 👈 add this prop
  file?: File;
  preview?: string | null;
}

export function ComicUploadModal({
	isOpen,
	onClose,
	file,
}: ComicUploadModalProps) {
	const [progress, setProgress] = useState(65); // starting at 65 for demo
	const [timeLeft, setTimeLeft] = useState(30); // seconds remaining
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (!paused && isOpen && progress < 100) {
			const interval = setInterval(() => {
				setProgress((p) => Math.min(p + 1, 100));
				setTimeLeft((t) => Math.max(t - 1, 0));
			}, 500);
			return () => clearInterval(interval);
		}
	}, [paused, isOpen, progress]);

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
			<div className='bg-black rounded-xl border border-white/20 p-5 w-full max-w-2xl'>
				{/* Top row with text and icons */}
				<div className='flex items-center justify-between mb-3'>
					<div>
						<p className='text-white font-semibold'>Uploading...</p>
						<p className='text-white/80 text-sm'>
							{progress}% • {timeLeft} seconds remaining
						</p>
					</div>

					<div className='flex items-center gap-4'>
						<button
							onClick={() => setPaused(!paused)}
							className='p-1 rounded-full hover:bg-white/10 text-white'
						>
							<Pause size={20} />
						</button>
						<button
							onClick={onClose}
							className='p-1 rounded-full hover:bg-white/10 text-red-500'
						>
							<X size={20} />
						</button>
					</div>
				</div>

				{/* Progress bar */}
				<div className='h-3 rounded-full bg-white/10 overflow-hidden'>
					<div
						className='h-3 bg-primary-400 transition-all duration-300'
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
