"use client";
import React, { useState } from "react";
import { MainButton, MainButton2 } from "../button";
import TextInput from "../TextAreaInput/TextInput";
import { Form, FormikProvider, useFormik } from "formik";
import { ImSpinner2 } from "react-icons/im";
import { LoginSchema } from "../Models/Forms";

interface WhitePaperModalProps {
	onClose: () => void;
}

interface LoginFormValues {
	email: string;
	password: string;
}

const WhitePaperModal = ({ onClose }: WhitePaperModalProps) => {
	const [showPassword, setShowPassword] = useState(false);
	const [isLogIn, setIsLogIn] = useState(false);
	const [isRegister, setIsRegister] = useState(false);

	const handlePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const LoginValues: LoginFormValues = {
		email: "",
		password: "",
	};
	const loginformik = useFormik({
		initialValues: LoginValues,
		validationSchema: LoginSchema,
		enableReinitialize: true,
		onSubmit: (values) => {
			console.log("value", values);
		},
	});

	const handleLogin = () => {
		setIsLogIn(true);
		setIsRegister(false);
	};
	const handleRegister = () => {
		setIsLogIn(false);
		setIsRegister(true);
	};
	return (
		<>
			{isRegister ? (
				<div className='mx-auto px-2 pt-12 pb-10 text-white w-[90%]'>
					<div className='space-y-2 text-center w-[80%] mx-auto'>
						<h3 className='text-xl sm:text-2xl font-bold'>
							Register for Quiva
						</h3>
						<p className='text-xs sm:text-sm text-white/80'>
							Where stories earn rewards, and every reader counts.
						</p>
					</div>
				</div>
			) : isLogIn ? (
				<div className='mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8 sm:pb-10 text-white w-full'>
					{/* Header Section */}
					<div className='space-y-2 text-center w-full sm:w-[80%] mx-auto'>
						<h3 className='text-xl sm:text-2xl font-bold'>Log in to Quiva</h3>
						<p className='text-xs sm:text-sm text-white/80'>
							Where stories earn rewards, and every reader counts.
						</p>
					</div>

					{/* Form Section */}
					<FormikProvider value={loginformik}>
						<Form className='space-y-4 sm:space-y-5 w-full sm:w-[80%] mt-4 sm:mt-5 mx-auto'>
							{/* Email Field */}
							<div className='space-y-1'>
								<TextInput
									id='email'
									label='Enter your email'
									type='text'
									className={`w-full px-3 py-3 sm:py-3.5 text-sm sm:text-base border ${
										loginformik.touched.email && loginformik.errors.email
											? "border-red-500"
											: "border-white/20"
									} focus:border-primary-100 bg-transparent rounded-md outline-none text-white placeholder:text-white/40`}
									placeholder='your@email.com'
									{...loginformik.getFieldProps("email")}
								/>
								{loginformik.touched.email && loginformik.errors.email && (
									<div className='text-red-400 text-xs sm:text-sm mt-1'>
										{loginformik.errors.email}
									</div>
								)}
							</div>

							{/* Password Field */}
							<div className='space-y-1'>
								<TextInput
									id='password'
									label='Enter Password'
									type={showPassword ? "text" : "password"}
									className={`w-full px-3 py-3 sm:py-3.5 text-sm sm:text-base border ${
										loginformik.touched.password && loginformik.errors.password
											? "border-red-500"
											: "border-white/20"
									} focus:border-primary-100 bg-transparent rounded-md outline-none text-white placeholder:text-white/40`}
									placeholder=''
									passwordIconClassname='top-3 sm:top-3.5'
									showPasswordIcon
									showPassword={showPassword}
									togglePasswordVisibility={handlePasswordVisibility}
									{...loginformik.getFieldProps("password")}
								/>
								{loginformik.touched.password &&
									loginformik.errors.password && (
										<div className='text-red-400 text-xs sm:text-sm mt-1'>
											{loginformik.errors.password}
										</div>
									)}
							</div>

							{/* Submit Button */}
							<MainButton
								type='submit'
								className='w-full rounded-full font-semibold py-3 sm:py-3.5 text-sm sm:text-base'
							>
								{loginformik.isSubmitting ? (
									<span className='inline-flex items-center justify-center'>
										<svg
											className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
										>
											<circle
												className='opacity-25'
												cx='12'
												cy='12'
												r='10'
												stroke='currentColor'
												strokeWidth='4'
											></circle>
											<path
												className='opacity-75'
												fill='currentColor'
												d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
											></path>
										</svg>
										Logging in...
									</span>
								) : (
									"Log in"
								)}
							</MainButton>
						</Form>
					</FormikProvider>

					{/* Sign Up Prompt */}
					<div className='text-center text-xs sm:text-sm text-white/80 border-t border-white/10 pt-4 mt-6 w-full sm:w-[70%] mx-auto'>
						Don&apos;t have an account?{" "}
						<button
							onClick={handleRegister}
							className='text-secondary-200 font-semibold cursor-pointer underline-offset-4 hover:underline transition duration-200 focus:outline-none'
						>
							Sign Up
						</button>
					</div>
				</div>
			) : (
				<div className='max-w-md w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 text-white'>
					{/* Welcome Header - Responsive text sizing */}
					<div className='space-y-2 text-center w-full sm:w-[80%] mx-auto'>
						<h3 className='text-xl sm:text-2xl font-bold'>Welcome to Quiva</h3>
						<p className='text-xs sm:text-sm text-white/80'>
							Where stories earn rewards, and every reader counts.
						</p>
					</div>

					{/* Social Buttons - Stacked on mobile */}
					<div className='space-y-3 sm:space-y-2 mt-6 mb-4'>
						<MainButton className='w-full rounded-full font-semibold py-3 sm:py-2.5 text-sm sm:text-base'>
							Sign in with X
						</MainButton>
						<MainButton className='w-full rounded-full font-semibold py-3 sm:py-2.5 text-sm sm:text-base'>
							Continue with Google
						</MainButton>
					</div>

					{/* Divider with "Or" - Responsive spacing */}
					<div className='relative text-center my-5 sm:my-4'>
						<div className='w-full h-px bg-white/10' />
						<span className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black-900 px-2 text-xs sm:text-sm text-white/80'>
							Or
						</span>
					</div>

					{/* Email Sign Up - Responsive button size */}
					<MainButton2 className='w-full bg-transparent border-white/70 rounded-full font-semibold mt-2 sm:mt-3 py-3 sm:py-2.5 text-sm sm:text-base'>
						Sign up with Email
					</MainButton2>

					{/* Terms Checkbox - Improved mobile layout */}
					<div className='flex items-start justify-center gap-2 text-xs sm:text-sm text-white/60 mt-5 sm:mt-6'>
						<input
							type='checkbox'
							className='accent-secondary-200 size-4 sm:size-[14px] mt-0.5 sm:mt-0 cursor-pointer bg-transparent'
						/>
						<h4 className='text-left'>
							I agree to the [Terms of Service] and [Privacy Policy].
						</h4>
					</div>

					{/* Login Prompt - Responsive border and padding */}
					<div className='text-center text-xs sm:text-sm text-white/80 border-t border-white/10 pt-4 sm:pt-3 mt-6 sm:mt-7'>
						Already have an account?{" "}
						<button
							onClick={handleLogin}
							className='text-secondary-200 font-semibold cursor-pointer underline-offset-4 hover:underline transition duration-200 focus:outline-none'
						>
							Log In
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default WhitePaperModal;
