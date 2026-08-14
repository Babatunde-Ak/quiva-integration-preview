import React from "react";

interface EarningsDetailsModalProps {
	onClose: () => void;
}

const EarningsDetailsModal = ({ onClose }: EarningsDetailsModalProps) => {
	return (
		<div className='text-white p-6 w-full space-y-8'>
			<h2 className='text-xl font-semibold'>History Details</h2>

			<div className='space-y-8 text-sm'>
				<div className='flex justify-between'>
					<span className='font-medium'>Readers Full Name:</span>
					<span className='text-orange-400'>Oladele Ewatomi</span>
				</div>

				<div className='flex justify-between'>
					<span className='font-medium'>Books Read</span>
					<span className='text-orange-400'>Solo Traveling</span>
				</div>

				<div className='flex justify-between'>
					<span className='font-medium'>Payment Status</span>
					<span className='text-orange-400'>Paid</span>
				</div>

				<div className='flex justify-between'>
					<span className='font-medium'>Date</span>
					<span className='text-orange-400'>Jan 2, 2025</span>
				</div>

				<div className='flex justify-between'>
					<span className='font-medium'>Amount Paid</span>
					<span className='text-orange-400'>$50</span>
				</div>
			</div>

			<button
				onClick={onClose}
				className='w-fit px-6 mt-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition'
			>
				Close
			</button>
		</div>
	);
};

export default EarningsDetailsModal;
