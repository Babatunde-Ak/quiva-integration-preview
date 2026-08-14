"use client";
import React, { useState } from "react";
import {
	heroImage1,
	heroImage2,
	hm_bg_2,
	mascotThree2
} from "../../../../public/dev_images";
import { motion } from "framer-motion";
import Picture from "@/components/picture/Index";
import Image from "next/image";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import { useAppSelector } from "@/redux/hook";
import WaitlistModal from "./waitlist-modal";
import axiosInstance from "@/redux/axios-instance";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import { AxiosError } from "axios";

const validationSchema = Yup.object({
	email: Yup.string()
		.email("Please enter a valid email address")
		.required("Email is required"),
});

const initialValues = {
	email: "",
};

const Waitlist = () => {
	const { waitlist: waitlistState } = useAppSelector((state: any) => state.general);
	const [showModal, setShowModal] = useState(false);

	const handleSubmit = async (values: { email: string }, { resetForm, setSubmitting }: any) => {
		console.log("Submitting waitlist with values:", values);
		try {
			const response = await axiosInstance.post(`/waitlist/join`, values);
			    
            if(response.data && response.data.success){
                toast.success("Successfully joined the waitlist!");
                setShowModal(true);
            }

			resetForm();
		} catch (error) {
			const err = error as AxiosError<{ message: string }>;
			const errorMessage =
				err.response?.data?.message || "Please try again later.";
			console.error("Waitlist submission failed:", errorMessage);
			toast.error(errorMessage);
		} finally {
			setSubmitting(false);
		}
	};

	const closeModal = () => {
		setShowModal(false);
	};

	return (
		<>
			<ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark"/>
			<section className='min-h-screen grid place-items-center relative bg-black-100 overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='relative w-full h-full'>
						<Link href="/">
                            <Picture
                                src={hm_bg_2}
                                alt='home bg'
                                loading='eager'
                                className='w-full h-full object-cover lg:object-fill grayscale'
						    />
                        </Link>
						<div className='absolute inset-0 bg-black-100 opacity-90'></div>
					</div>
				</div>

				<div className='w-full h-full lg:w-[75%] mx-auto flex flex-col items-center text-center lg:text-start lg:h-[70%] lg:grid grid-cols-10 z-10'>
					<div className='col-span-6 flex lg:items-start flex-col items-center space-y-5 lg:space-y-8 justify-center w-[95%] lg:w-full pt-32 lg:pt-0'>
						{/* Logo */}
                        <Link href="/">
                            <Image
                                src="/logo.png"
                                alt="Quiva Logo"
                                width={110}
                                height={45}
                                className="mb-6 w-28 md:w-32"
                            />
                        </Link>

						{/* Title */}
						<h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-bold mb-4 leading-snug max-w-xl">
							Bring Your Comic to Life. Get Discovered
						</h1>

						{/* Subtitle */}
						<p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 max-w-md">
							Join our exclusive creator community and showcase your stories to
							readers worldwide.
						</p>

						{/* Formik Form */}
						<Formik
							initialValues={initialValues}
							validationSchema={validationSchema}
							onSubmit={handleSubmit}
						>
							{({ isSubmitting, errors, touched }) => (
								<Form className="relative w-full max-w-md px-2">
									<div className="relative">
										<Field
											type="email"
											name="email"
											placeholder="Enter your email"
											className={`w-full px-4 py-3 pr-32 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
												errors.email && touched.email
													? "ring-2 ring-red-500"
													: ""
											}`}
											aria-label="Email address"
											disabled={isSubmitting || waitlistState?.status}
										/>

										<button
											type="submit"
											disabled={isSubmitting || waitlistState?.status}
											className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-yellow-500 text-black px-8 py-2 rounded-xl font-semibold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{isSubmitting || waitlistState?.status ? "Joining..." : "Join Waitlist"}
										</button>
									</div>

									{/* Error Messages */}
									<ErrorMessage
										name="email"
										component="div"
										className="text-red-400 text-sm mt-2 text-left"
									/>
									
									{/* Redux Error */}
									{waitlistState?.error && (
										<div className="text-red-400 text-sm mt-2 text-left">
											{waitlistState.error}
										</div>
									)}
								</Form>
							)}
						</Formik>
					</div>
					
					<div className='col-span-4 mt-5 lg:mt-0 lg:grid place-items-center'>
						<div className='relative w-full max-w-[762px] mx-auto mt-12'>
							{/* BACKGROUND IMAGE LAYER (Behind Mascot) */}
							<div className='absolute inset-0 flex justify-center items-start pointer-events-none -z-10'>
								<div className='w-[280px] sm:w-[320px] md:w-[360px] lg:w-[404.04px] h-[300px] relative grid place-items-center'>
									<motion.div
										initial={{ opacity: 0, y: 40 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: false, amount: 0.4 }}
										transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
										className='absolute top-4 lg:-top-12 w-[80%] xs:w-[300px] sm:w-[320px] md:w-[360px] lg:w-[400px]'
									>
										<Picture src={heroImage2} alt='Quiva logo' loading='eager' />
									</motion.div>

									<motion.div
										initial={{ opacity: 0, scale: 0.95 }}
										whileInView={{ opacity: 1, scale: 1 }}
										viewport={{ once: false, amount: 0.4 }}
										transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
										className='absolute top-4 lg:-top-12 w-[70%] xs:w-[280px] sm:w-[284px] md:w-[320px] lg:w-[356px]'
									>
										<Picture src={heroImage1} alt='Quiva logo' loading='eager' />
									</motion.div>
								</div>
							</div>

							{/* FOREGROUND MASCOT IMAGE */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false, amount: 0.4 }}
								transition={{ duration: 1, delay: 1.1 }}
								className='relative w-[80%] sm:w-[762px] mx-auto object-cover -mt-10 z-10'
							>
								<Picture
									src={mascotThree2}
									alt='Mascot three quarter'
									loading='eager'
								/>
							</motion.div>
						</div>
					</div>
				</div>
			</section>

			{/* Thank You Modal */}
			<WaitlistModal isOpen={showModal} onClose={closeModal} />
		</>
	);
};

export default Waitlist;