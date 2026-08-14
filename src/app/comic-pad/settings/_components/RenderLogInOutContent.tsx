import React from "react";

const RenderLogInOutContent = () => {
	return (
		<div className='mt-4 sm:mt-6 md:mt-8 p-4 sm:p-5 md:p-6 md:pl-0 rounded-lg'>
			<h2 className='text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-gray-50'>
				Log In & Out
			</h2>
			<p className='text-gray-50/50 text-sm sm:text-base md:text-lg leading-relaxed'>
				Login options or logout button would be here.
			</p>
			<button className='mt-3 sm:mt-4 bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3  rounded-lg w-full sm:w-auto text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50'>
				Log Out
			</button>
		</div>
	);
};

export default RenderLogInOutContent;
