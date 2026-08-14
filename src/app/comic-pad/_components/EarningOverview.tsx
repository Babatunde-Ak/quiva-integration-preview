import TitleText from "@/components/text/TitleText";
import { OVERVIEW_CARDS } from "@/components/utils/constant";
import React from "react";
import { PiFileArrowDownDuotone } from "react-icons/pi";
import { BsSend } from "react-icons/bs";
import {
	FiArrowUpRight,
	FiArrowDownRight,
	FiRefreshCw,
	FiEyeOff,
} from "react-icons/fi";

const EarningOverview = () => {
	return (
		<div className='text-white py-5 px-3 lg:p-6 rounded-xl gap-6 justify-between items-center grid grid-cols-10'>
			{/* Left: Overview boxes */}
			<div className='col-span-10 lg:col-span-7'>
				<TitleText
					title='Welcome'
					className='text-white/70 !text-sm lg:!text-lg'
				/>
				<div className='flex items-center gap-2 my-3 lg:my-4'>
					<div className='w-4 h-8 bg-amber-500/70 rounded'></div>
					<h2 className='text-sm lg:text-lg font-semibold'>Overview</h2>
				</div>

				<div className='gap-6 grid lg:grid-cols-2'>
					{OVERVIEW_CARDS.map(
						({
							id,
							title,
							value,
							change,
							changeColor,
							changeBg,
							Icon,
							Icon2,
						}) => (
							<div
								key={id}
								className='border border-amber-500 rounded-lg px-3 lg:px-6 py-3 lg:py-4 flex flex-col'
							>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<div className={`p-1.5 ${changeBg} rounded-full`}>
											<Icon2 className={`w-4 h-4 mr-0.5 ${changeColor}`} />
										</div>
										<span className='text-xs lg:text-sm text-gray-50/70 font-medium tracking-wider'>
											{title}
										</span>
									</div>
									<span
										className={`flex items-center text-xs rounded font-medium tracking-wider px-1.5 py-1 ${changeColor} ${changeBg}`}
									>
										<Icon className='w-4 h-4 mr-0.5' /> {change}
									</span>
								</div>
								<p className='text-xl lg:text-2xl font-bold mt-1'>{value}</p>
							</div>
						),
					)}
				</div>
			</div>
			{/* Right: Account balance */}
			<div className='flex flex-col w-full items-center lg:items-end space-y-4 col-span-10 lg:col-span-3'>
				<div className='flex flex-col items-center gap-3'>
					<h2 className='text-white/70 font-semibold'>Account Balance</h2>
					<div className='flex items-center gap-3 text-amber-400 text-xl font-semibold'>
						<FiRefreshCw className='w-5 h-5 text-gray-50/80' />
						<span>$150,946.55</span>
						<FiEyeOff className='w-5 h-5 text-gray-50/70 cursor-pointer' />
					</div>
					<p className='text-gray-50/80 tracking-wider text-sm'>
						
					</p>
					<div className='flex gap-4'>
						<button className='bg-secondary-300 text-black w-20 py-2 rounded-lg font-medium hover:bg-amber-400 transition flex flex-col items-center'>
							<BsSend className='text-lg' />
							<span className='text-sm'>Send</span>
						</button>
						<button className='bg-secondary-300 text-black w-20 py-2 rounded-lg font-medium hover:bg-amber-400 transition flex flex-col items-center'>
							<PiFileArrowDownDuotone className='text-xl' />
							<span className='text-sm'>Withdraw</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EarningOverview;
