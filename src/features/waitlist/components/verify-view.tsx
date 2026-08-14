"use client";
import React, {useState, useEffect} from "react";
import {heroImage1, heroImage2, hm_bg_2, mascotThree2} from "../../../../public/dev_images";
import {motion} from "framer-motion";
import Picture from "@/components/picture/Index";
import Image from "next/image";
import {useSearchParams, useRouter} from "next/navigation";
import axiosInstance from "@/redux/axios-instance";
import {toast} from "react-toastify";
import Link from "next/link";

interface VerificationStatus {
    status : 'loading' | 'success' | 'error' | 'expired';
    message : string;
}

const Verify = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [verificationStatus,
        setVerificationStatus] = useState < VerificationStatus > ({status: 'loading', message: 'Verifying your email...'});

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        } else {
            setVerificationStatus({status: 'error', message: 'Invalid verification link - missing token'});
        }
    }, [token]);

    const verifyEmail = async(verificationToken : string) => {
        try {
            const response = await axiosInstance.get(`/waitlist/verify/${verificationToken}`);

            if (response.data && response.data.success) {
                setVerificationStatus({status: 'success', message: 'Email verified successfully! Welcome to Quiva.'});
                toast.success("Email verified successfully!");
            } else {
                setVerificationStatus({
                    status: 'error',
                    message: response.data
                        ?.message || 'Verification failed'
                });
            }
        } catch (error : any) {
            console.error("Email verification failed:", error);

            const errorMessage = error
                ?.response
                    ?.data
                        ?.message || 'Verification failed';
            const isExpired = errorMessage
                .toLowerCase()
                .includes('expired') || errorMessage
                .toLowerCase()
                .includes('invalid');

            setVerificationStatus({
                status: isExpired
                    ? 'expired'
                    : 'error',
                message: errorMessage
            });

            toast.error(errorMessage);
        }
    };

    const handleReturnToWaitlist = () => {
        router.push('/waitlist');
    };

    const getStatusIcon = () => {
        switch (verificationStatus.status) {
            case 'loading':
                return (
                    <div
                        className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                );
            case 'success':
                return (
                    <div
                        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                );
            case 'error':
            case 'expired':
                return (
                    <div
                        className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    const getStatusTitle = () => {
        switch (verificationStatus.status) {
            case 'loading':
                return 'Verifying Email...';
            case 'success':
                return 'Email Verified!';
            case 'error':
                return 'Verification Failed';
            case 'expired':
                return 'Link Expired';
            default:
                return '';
        }
    };

    const getStatusColor = () => {
        switch (verificationStatus.status) {
            case 'success':
                return 'text-green-800';
            case 'error':
            case 'expired':
                return 'text-red-400';
            default:
                return 'text-white';
        }
    };

    return (
        <section
            className='min-h-screen grid place-items-center relative bg-black-100 overflow-hidden'>
            <div className='absolute inset-0'>
                <div className='relative w-full h-full'>
                    <Link href="/">
                        <Picture
                            src={hm_bg_2}
                            alt='home bg'
                            loading='eager'
                            className='w-full h-full object-cover lg:object-fill grayscale'/>
                    </Link>
                    <div className='absolute inset-0 bg-black-100 opacity-90'></div>
                </div>
            </div>

            <div
                className='w-full h-full lg:w-[75%] mx-auto flex flex-col items-center text-center lg:text-start lg:h-[70%] lg:grid grid-cols-10 z-10'>
                <div
                    className='col-span-6 flex lg:items-start flex-col items-center space-y-5 lg:space-y-8 justify-center w-[95%] lg:w-full pt-32 lg:pt-0'>
                    {/* Logo */}
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="Quiva Logo"
                            width={110}
                            height={45}
                            className="mb-6 w-28 md:w-32"/>
                    </Link>

                    {/* Status Icon */}
                    {getStatusIcon()}

                    {/* Title */}
                    <h1
                        className={`text-2xl sm:text-3xl md:text-5xl font-bold mb-4 leading-snug max-w-xl ${getStatusColor()}`}>
                        {getStatusTitle()}
                    </h1>

                    {/* Message */}
                    <p
                        className="text-sm sm:text-base md:text-lg text-white/80 mb-6 max-w-md text-center">
                        {verificationStatus.message}
                    </p>

                    {/* Email Display */}
                    {email && (
                        <p className="text-xs text-white/60 mb-4 max-w-md text-center">
                            Verifying: {decodeURIComponent(email)}
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-2">
                        {verificationStatus.status === 'success' && (
                            <Link
                                href="/"
                                className="w-full bg-yellow-500 text-black px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition text-center">
                                Go to Home
                            </Link>
                        )}

                        {(verificationStatus.status === 'error' || verificationStatus.status === 'expired') && (
                            <button
                                onClick={handleReturnToWaitlist}
                                className="w-full bg-yellow-500 text-black px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition">
                                Return to Waitlist
                            </button>
                        )}

                        <Link
                            href="/"
                            className="w-full bg-transparent border-2 border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:border-white/50 transition text-center">
                            Back to Home
                        </Link>
                    </div>

                    {/* Additional Info for Expired Links */}
                    {verificationStatus.status === 'expired' && (
                        <p className="text-xs text-white/60 max-w-md text-center">
                            Your verification link has expired. Please return to the waitlist to receive a
                            new verification email.
                        </p>
                    )}

                    {/* Debug Info (only in development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div
                            className="text-xs text-white/40 max-w-md text-center mt-4 p-2 bg-white/10 rounded">
                            <p>Token: {token
                                    ? `${token.substring(0, 10)}...`
                                    : 'Not found'}</p>
                            <p>Email: {email
                                    ? decodeURIComponent(email)
                                    : 'Not found'}</p>
                        </div>
                    )}
                </div>

                <div className='col-span-4 mt-5 lg:mt-0 lg:grid place-items-center'>
                    <div className='relative w-full max-w-[762px] mx-auto mt-12'>
                        {/* BACKGROUND IMAGE LAYER (Behind Mascot) */}
                        <div
                            className='absolute inset-0 flex justify-center items-start pointer-events-none -z-10'>
                            <div
                                className='w-[280px] sm:w-[320px] md:w-[360px] lg:w-[404.04px] h-[300px] relative grid place-items-center'>
                                <motion.div
                                    initial={{
                                    opacity: 0,
                                    y: 40
                                }}
                                    whileInView={{
                                    opacity: 1,
                                    y: 0
                                }}
                                    viewport={{
                                    once: false,
                                    amount: 0.4
                                }}
                                    transition={{
                                    duration: 1,
                                    delay: 0.2,
                                    ease: "easeOut"
                                }}
                                    className='absolute top-4 lg:-top-12 w-[80%] xs:w-[300px] sm:w-[320px] md:w-[360px] lg:w-[400px]'>
                                    <Picture src={heroImage2} alt='Quiva logo' loading='eager'/>
                                </motion.div>

                                <motion.div
                                    initial={{
                                    opacity: 0,
                                    scale: 0.95
                                }}
                                    whileInView={{
                                    opacity: 1,
                                    scale: 1
                                }}
                                    viewport={{
                                    once: false,
                                    amount: 0.4
                                }}
                                    transition={{
                                    duration: 1,
                                    delay: 0.4,
                                    ease: "easeOut"
                                }}
                                    className='absolute top-4 lg:-top-12 w-[70%] xs:w-[280px] sm:w-[284px] md:w-[320px] lg:w-[356px]'>
                                    <Picture src={heroImage1} alt='Quiva logo' loading='eager'/>
                                </motion.div>
                            </div>
                        </div>

                        {/* FOREGROUND MASCOT IMAGE */}
                        <motion.div
                            initial={{
                            opacity: 0,
                            y: 30
                        }}
                            whileInView={{
                            opacity: 1,
                            y: 0
                        }}
                            viewport={{
                            once: false,
                            amount: 0.4
                        }}
                            transition={{
                            duration: 1,
                            delay: 1.1
                        }}
                            className='relative w-[80%] sm:w-[762px] mx-auto object-cover -mt-10 z-10'>
                            <Picture src={mascotThree2} alt='Mascot three quarter' loading='eager'/>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Verify;