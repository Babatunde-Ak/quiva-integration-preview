"use client";
import Picture from "@/components/picture/Index";
import React from "react";
import { StaticImageData } from "next/image";
import GeneralModal from "@/components/modals/GeneralModal";
import { useDisclosure } from "@heroui/react";
import EarningsDetailsModal from "@/components/modals/EarningsDetailsModal";

type HistoryRow = {
	avatar: string | StaticImageData;
	name: string;
	book: string;
	status: "Pending" | "Received";
	date: string;
	amount: string;
};

const data: HistoryRow[] = [];

const EarningHistory = () => {
	const {
		isOpen: isOpenEarningsDetailsOpen,
		onOpen: onOpenEarningsDetails,
		onOpenChange: onOpenChangeEarningsDetails,
		onClose: onCloseEarningsDetails,
	} = useDisclosure();

	return (
		<>
			<div className='bg-black text-white p-4 sm:p-6 rounded-xl'>
				<h2 className='text-lg font-semibold mb-4 text-white/80'>History</h2>

				{data.length === 0 && (
					<div className='py-16 flex flex-col items-center justify-center text-white/40 gap-2'>
						<p className='text-sm'>No earnings history yet.</p>
						<p className='text-xs'>Your transaction history will appear here once you start earning.</p>
					</div>
				)}

				{/* Desktop Table */}
				<div className='hidden lg:block overflow-x-auto'>
					<table className='w-full min-w-[600px]'>
						<thead>
							<tr className='text-left text-sm text-gray-50/80 border-t border-primary-500'>
								<th className='py-4 pl-4 pr-6'>Reader</th>
								<th className='py-4 px-6'>Books Read</th>
								<th className='py-4 px-6'>Status</th>
								<th className='py-4 px-6'>Date</th>
								<th className='py-4 px-6'>Amount</th>
								<th className='py-4 pl-6 pr-4'></th>
							</tr>
						</thead>
						<tbody>
							{data.map((row, i) => (
								<tr
									key={i}
									className='border-t border-primary-500 text-sm text-white/70'
								>
									<td className='py-3 flex items-center gap-3 font-semibold pl-4 pr-6'>
										<Picture
											src={row.avatar}
											alt={row.name}
											className='rounded-sm size-10'
										/>
										{row.name}
									</td>
									<td className='py-3 px-6 tracking-wide font-medium'>
										{row.book}
									</td>
									<td className='py-3 px-6'>
										<span
											className={`px-3 py-1 rounded-md text-xs font-semibold ${
												row.status === "Pending"
													? "bg-primary-100/40 text-primary-400"
													: "bg-amber-500"
											}`}
										>
											{row.status}
										</span>
									</td>
									<td className='py-3 px-6 font-medium'>{row.date}</td>
									<td className='py-3 px-6 font-medium'>{row.amount}</td>
									<td className='py-3 pl-6 pr-4'>
										<button
											onClick={onOpenEarningsDetails}
											className='px-4 font-medium py-1 text-primary-400 border border-primary-400 rounded-md hover:bg-primary-400 hover:text-white/90 transition-colors'
										>
											Details
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Mobile Cards */}
				<div className='lg:hidden space-y-4'>
					{data.map((row, i) => (
						<div
							key={i}
							className='border border-primary-500 rounded-lg p-4 space-y-3'
						>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<Picture
										src={row.avatar}
										alt={row.name}
										className='rounded-sm size-10'
									/>
									<div>
										<p className='text-sm font-semibold text-white'>
											{row.name}
										</p>
										<p className='text-xs text-white/70'>{row.book}</p>
									</div>
								</div>
								<span
									className={`px-2 py-1 rounded text-xs font-semibold ${
										row.status === "Pending"
											? "bg-primary-100/40 text-primary-400"
											: "bg-amber-500"
									}`}
								>
									{row.status}
								</span>
							</div>

							<div className='grid grid-cols-2 gap-4 text-sm'>
								<div>
									<p className='text-white/50 text-xs'>Date</p>
									<p className='text-xs font-medium'>{row.date}</p>
								</div>
								<div>
									<p className='text-white/50 text-xs'>Amount</p>
									<p className='text-xs font-medium'>{row.amount}</p>
								</div>
							</div>

							<button
								onClick={onOpenEarningsDetails}
								className='w-full px-4 text-sm font-medium py-2 text-primary-400 border border-primary-400 rounded-md hover:bg-primary-400 hover:text-white/90 transition-colors'
							>
								View Details
							</button>
						</div>
					))}
				</div>
			</div>

			<GeneralModal
				isOpen={isOpenEarningsDetailsOpen}
				onOpenChange={onOpenChangeEarningsDetails}
				onClose={onCloseEarningsDetails}
				backdrop='blur'
				size='sm'
			>
				<EarningsDetailsModal onClose={onCloseEarningsDetails} />
			</GeneralModal>
		</>
	);
};

export default EarningHistory;
