	"use client";
import React, { useState, useEffect } from "react";
import { MainButton, MainButton2 } from "../button";
import TextInput from "../TextAreaInput/TextInput";
import { Form, FormikProvider, useFormik } from "formik";
import { ImSpinner2 } from "react-icons/im";
import { FaCircleRight } from "react-icons/fa6";
import { LoginSchema } from "../Models/Forms";
import { walletImg } from "../../../public/dev_images";
import Picture from "../picture/Index";
import { FaArrowLeft } from "react-icons/fa";
import { HiEnvelope } from "react-icons/hi2";
import { InputOtp } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { sendOtpEmail, verifyOtpEmail, resetOtpStates, clearErrors } from "@/redux/slices/authSlice";

interface WhitePaperModalProps {
	onClose: () => void;
	modalPage: string | null;
	setModalPage: (page: string | null) => void;
	onLoginSuccess?: () => void;
}

interface LoginFormValues {
	email: string;
}

const WhitePaperModal = ({ onClose, modalPage, setModalPage, onLoginSuccess }: WhitePaperModalProps) => {
	const [isVerificationCode, setIsVerificationCode] = useState(false);
	const [otpValue, setOtpValue] = useState("");
	const [emailValue, setEmailValue] = useState("");
	
	const router = useRouter();
	const dispatch = useAppDispatch();
	
	// Redux state selectors
	const { 
		sendOtp: { isLoading: isSendingOtp, error: sendOtpError, success: sendOtpSuccess, email: sentEmail },
		verifyOtp: { isLoading: isVerifyingOtp, error: verifyOtpError, success: verifyOtpSuccess },
		user: { isAuthenticated }
	} = useAppSelector((state: any) => state.auth);

	// Form validation
	const LoginValues: LoginFormValues = {
		email: "",
	};

	const formik = useFormik({
		initialValues: LoginValues,
		validationSchema: LoginSchema,
		enableReinitialize: true,
		onSubmit: async (values) => {
			setEmailValue(values.email);
			try {
				await dispatch(sendOtpEmail({ email: values.email } as any)).unwrap();
			} catch (error) {
				console.error('Failed to send OTP:', error);
			}
		},
	});

	// Handle email form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// If form has email value, submit it
		if (emailValue.trim()) {
			try {
				await dispatch(sendOtpEmail({ email: emailValue } as any)).unwrap();
				setModalPage("modal");
			} catch (error) {
				console.error('Failed to send OTP:', error);
			}
		} else {
			formik.handleSubmit();
		}
	};

	// Handle OTP verification
	const handleOtpComplete = async (otp: string) => {
		console.log('OTP entered:', otp);
		if (otp.length === 6) {
			setOtpValue(otp);
			try {
				const response = await dispatch(verifyOtpEmail({ 
					email: sentEmail || emailValue, 
					code: otp 
				} as any)).unwrap();
				setModalPage("whitepaper");
				console.log('OTP verification response:', response);
			} catch (error) {
				console.error('Failed to verify OTP:', error);
			}
		}
	};

	// Handle resend OTP
	const handleResendOtp = async () => {
		if (sentEmail || emailValue) {
			try {
				await dispatch(sendOtpEmail({ email: sentEmail || emailValue } as any)).unwrap();
			} catch (error) {
				console.error('Failed to resend OTP:', error);
			}
		}
	};

	// Effect to handle OTP send success
	useEffect(() => {
		if (sendOtpSuccess) {
			setIsVerificationCode(true);
		}
	}, [sendOtpSuccess]);

	// // Effect to handle OTP verification success
	// useEffect(() => {
	// 	if (verifyOtpSuccess && isAuthenticated) {

	// 		router.push("/marketplace");
	// 		// setModalPage("user-profile");


	// }}, [verifyOtpSuccess, isAuthenticated, router, onClose]);

		useEffect(() => {
		if (verifyOtpSuccess && isAuthenticated) {
			// Instead of routing to marketplace, trigger the user profile flow
			if (onLoginSuccess) {
				onLoginSuccess(); // This will trigger opening the user profile modal
			} else {
				// Fallback to direct routing if callback not provided
				router.push("/marketplace");
			}
		}
	}, [verifyOtpSuccess, isAuthenticated, router, onLoginSuccess]);

	// Effect to clear errors when modal closes
	useEffect(() => {
		return () => {
			dispatch(clearErrors());
		};
	}, [dispatch]);

	// Handle back button in verification view
	const handleBackToEmail = () => {
		setIsVerificationCode(false);
		setOtpValue("");
		dispatch(resetOtpStates());
	};

	return (
		<>
			{isVerificationCode || modalPage === "otp" ? (
				<div className='w-full max-w-md mx-auto text-white py-8 sm:py-12 space-y-4 lg:space-y-8'>
					<div className='grid grid-cols-5 items-center w-full gap-0 px-2'>
						{/* Back Button */}
						<div className='col-span-1'>
							<FaArrowLeft
								className='text-white/50 text-xl hover:text-white/90 cursor-pointer transition-[.3] hover:-translate-x-1'
								onClick={handleBackToEmail}
							/>
						</div>

						{/* Title */}
						<h3 className='text-sm sm:text-xl text-center font-bold col-span-3'>
							Confirm verification code
						</h3>
						<div className='col-span-1'></div>
					</div>

					{/* Mail Icon */}
					<div className='flex justify-center mb-4'>
						<div className='w-12 h-12 flex items-center justify-center rounded-full bg-secondary-300/90'>
							<HiEnvelope className='text-black-100 text-3xl' />
						</div>
					</div>

					{/* Email Notice */}
					<p className='text-center text-sm text-white/80 mb-6'>
						We&apos;ve sent a verification code to <br />
						<span className='font-semibold text-white'>
							{sentEmail || emailValue}
						</span>
					</p>

					{/* Error Display */}
					{verifyOtpError && (
						<div className='text-red-500 text-center text-sm mb-4'>
							{typeof verifyOtpError === 'string' ? verifyOtpError : 'Failed to verify OTP. Please try again.'}
						</div>
					)}

					{/* Code Input Boxes */}
					<InputOtp
						length={6}
						variant='faded'
						size='lg'
						color='warning'
						className='mx-auto'
						value={otpValue}
						onValueChange={setOtpValue}
						onComplete={handleOtpComplete}
						isDisabled={isVerifyingOtp}
						classNames={{
							base: "gap-12",
							input:
								"w-12 h-14 text-center text-lg font-bold rounded-md text-white bg-black-100 border border-white/20 focus:border-secondary focus:ring-1 focus:ring-secondary placeholder:text-white/40",
						}}
						autoComplete='one-time-code'
					/>

					{/* Loading Indicator */}
					{isVerifyingOtp && (
						<div className='flex justify-center'>
							<ImSpinner2 className='animate-spin text-white text-xl' />
						</div>
					)}

					{/* Resend Code */}
					<p className='text-center text-xs text-white/60'>
						Didn&apos;t receive a code? Check spam or <br />
						<button 
							className='hover:text-primary-100 font-medium hover:underline transition-[.3] underline-offset-4 disabled:opacity-50'
							onClick={handleResendOtp}
							disabled={isSendingOtp}
						>
							{isSendingOtp ? 'Sending...' : 'Re-send Code'}
						</button>
					</p>
				</div>
			) : (
				<FormikProvider value={formik}>
					<Form className='w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 text-white'>
						{/* Welcome Header */}
						<div className='space-y-2 text-center w-full sm:w-[80%] mx-auto'>
							<h3 className='text-lg sm:text-2xl font-bold'>
								Login or Sign up
							</h3>
						</div>

						{/* Error Display */}
						{sendOtpError && (
							<div className='text-red-500 text-center text-sm'>
								{typeof sendOtpError === 'string' ? sendOtpError : 'Failed to send OTP. Please try again.'}
							</div>
						)}

						{/* Email Input */}
						<div className='mt-6 relative flex items-center'>
							<input
								type='email'
								name='email'
								placeholder='Enter your email'
								value={formik.values.email}
								onChange={(e) => {
									formik.handleChange(e);
									setEmailValue(e.target.value);
								}}
								onBlur={formik.handleBlur}
								className='w-full px-3 py-4 lg:py-6 text-white/90 bg-gray-300 rounded-md hover:border-primary-100 focus:border-primary-100 focus:outline-none transition-colors duration-200 placeholder:text-white/70 text-base'
								disabled={isSendingOtp}
							/>
							
							{isSendingOtp ? (
								<ImSpinner2 className='absolute text-2xl text-white/70 right-3 animate-spin' />
							) : (
								<FaCircleRight
									className='absolute text-2xl lg:text-3xl text-white/70 right-3 cursor-pointer hover:text-white transition-colors'
									onClick={handleSubmit}
								/>
							)}
						</div>

						{/* Form Validation Error */}
						{formik.touched.email && formik.errors.email && (
							<div className='text-red-500 text-sm mt-1'>
								{formik.errors.email}
							</div>
						)}

						{/* Divider with "Or" */}
						<div className='relative text-center my-6'>
							<div className='w-full h-px bg-white/10' />
							<span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black-500 font-semibold px-3 text-xs sm:text-sm text-white/70'>
								Or
							</span>
						</div>

						{/* Connect Wallet Button */}
						<div className='cursor-pointer hover:opacity-80 transition-opacity'>
							<Picture
								src={walletImg}
								alt='Connect Wallet'
								loading='eager'
								className='w-full sm:h-full object-cover lg:object-fill grayscale'
							/>
						</div>

						{/* Terms */}
						<h4 className='text-white/60 text-center text-xs sm:text-sm mt-6 leading-relaxed'>
							If you have not logged in before, you will create a new Quiva
							account. By proceeding, you agree to our <br />
							<b className='text-white'>Terms of Service & Privacy Policy.</b>
						</h4>
					</Form>
				</FormikProvider>
			)}
		</>
	);
};

export default WhitePaperModal;