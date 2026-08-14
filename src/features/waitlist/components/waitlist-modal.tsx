import React from 'react'
import { motion } from "framer-motion";

const WaitlistModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center"
            >
                <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Thank You!
                    </h3>
                    <p className="text-gray-600">
                        Welcome to the Quiva waitlist! Check your email and click the verification link to secure your spot. We&apos;ll notify you as soon as we&apos;re ready to launch!
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="w-full bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl hover:bg-yellow-400 transition-colors"
                >
                    Got it!
                </button>
            </motion.div>
        </div>
    );
};

export default WaitlistModal