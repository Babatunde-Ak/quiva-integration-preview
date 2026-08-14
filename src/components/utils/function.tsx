import Link from "next/link";
import Picture from "../picture/Index";
import { tonmicIcon } from "../../../public/dev_images";
import { BOOK_TABS, BookType } from "./constant";

export const isValidImage = (url: string): Promise<boolean> => {
	return new Promise((resolve) => {
		const img = new Image();
		img.src = url;
		img.onload = () => resolve(true);
		img.onerror = () => resolve(false);
	});
};

interface QuivaLogoProps {
	logoClassName?: string;
	className?: string;
	showText?: boolean;
}

export const QuivaLogo = ({
	logoClassName,
	className,
	showText,
}: QuivaLogoProps) => {
	return (
		<Link href='/' className=''>
			<div
				className={`w-fit text-base lg:text-sm flex items-center gap-2 font-recursive ${className}`}
			>
				<Picture
					src={tonmicIcon}
					alt='Quiva logo'
					loading='eager'
					className={`w-10 lg:w-8 ${logoClassName}`}
				/>
				{showText && (
					<span className={`font-semibold text-black-200`}>Quiva</span>
				)}
			</div>
		</Link>
	);
};

type BookTabId = "all" | "paid" | "free";

interface BookTabsProps {
	activeTab: BookTabId;
	onTabChange: (tabId: any) => void;
}

export const BookTabs: React.FC<BookTabsProps> = ({
	activeTab,
	onTabChange,
}) => {
	return (
		<div className='flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-auto pb-2 sm:pb-1 hide-scrollbar'>
			{BOOK_TABS.map((tab) => (
				<button
					key={tab.id}
					onClick={() => onTabChange(tab?.id)}
					className={`relative flex items-center gap-1 sm:gap-2 px-2 sm:px-1 pb-2 sm:pb-3 text-sm sm:text-base md:text-lg font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
						activeTab === tab.id
							? "text-secondary-200"
							: "text-gray-500 hover:text-gray-700"
					}`}
				>
					{/* Tab Label - Hide on mobile, show icon instead if needed */}
					<span className='hidden xs:inline'>{tab.label}</span>
					<span className='xs:hidden text-xs'>
						{/* Short labels for mobile */}
						{tab.id === "all" && "All"}
						{tab.id === "paid" && "Paid"}
						{tab.id === "free" && "Free"}
					</span>

					{/* Count Badge */}
					<span
						className={`inline-flex items-center justify-center min-w-5 h-5 sm:min-w-6 sm:h-6 px-1 sm:px-1.5 rounded-full text-xs font-medium ${
							activeTab === tab.id
								? "bg-secondary-200/10 text-secondary-200"
								: "bg-gray-100 text-gray-500"
						}`}
					>
						{tab.count}
					</span>

					{/* Active Indicator */}
					{activeTab === tab.id && (
						<span className='absolute bottom-0 left-0 w-full h-0.5 bg-secondary-200 rounded-full' />
					)}
				</button>
			))}
		</div>
	);
};

interface BookCardProps {
	book: BookType;
	onBookClick?: (book: BookType) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onBookClick }) => {
	const handleClick = () => {
		onBookClick?.(book);
	};

	return (
		<div onClick={handleClick} className='group cursor-pointer'>
			<div className='relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-lg transition-all duration-300'>
				{/* Book Image */}
				<Picture
					src={book.image}
					alt={book.title}
					className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-300'
				/>

				{/* Premium Badge */}
				{!book.isFree && (
					<div className='absolute top-2 left-2'>
						<span className='inline-flex items-center px-2 py-1 bg-gradient-to-r from-primary-200 to-secondary-200 text-white text-xs font-semibold rounded-full shadow-lg'>
							<svg
								className='w-3 h-3 mr-1'
								fill='currentColor'
								viewBox='0 0 20 20'
							>
								<path
									fillRule='evenodd'
									d='M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z'
									clipRule='evenodd'
								/>
							</svg>
							Paid
						</span>
					</div>
				)}

				{/* Free Badge */}
				{book.isFree && (
					<div className='absolute top-2 left-2'>
						<span className='inline-flex items-center px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg'>
							<svg
								className='w-3 h-3 mr-1'
								fill='currentColor'
								viewBox='0 0 20 20'
							>
								<path
									fillRule='evenodd'
									d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
									clipRule='evenodd'
								/>
							</svg>
							FREE
						</span>
					</div>
				)}

				{/* Rating */}
				<div className='absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold'>
					<svg
						className='w-3 h-3 text-yellow-400'
						fill='currentColor'
						viewBox='0 0 20 20'
					>
						<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
					</svg>
					{book.rating}
				</div>

				<div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3'>
					<div className='flex items-center justify-between'>
						<span className='text-white font-semibold text-sm'>
							{book.isFree ? "Free" : `$${book.price}`}
						</span>
						<button className='opacity-0 group-hover:opacity-100 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 rounded-full transition-all duration-200'>
							<svg
								className='w-4 h-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 4v16m8-8H4'
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Book Info */}
			<div className='mt-3 space-y-1'>
				<h3 className='font-semibold text-gray-50/80 text-sm line-clamp-1 group-hover:text-primary-100 transition-colors'>
					{book.title}
				</h3>
				<p className='text-gray-600 text-xs'>{book.author}</p>
			</div>
		</div>
	);
};

interface BookGridProps {
	books: BookType[];
	onBookClick?: (book: BookType) => void;
}

export const BookGrid: React.FC<BookGridProps> = ({ books, onBookClick }) => {
	if (books.length === 0) {
		return (
			<div className='text-center py-8 sm:py-12'>
				<div className='text-gray-400 text-base sm:text-lg'>No books found</div>
				<p className='text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2'>
					Try selecting a different category
				</p>
			</div>
		);
	}

	return (
		<div className='grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6'>
			{books.map((book) => (
				<BookCard key={book.id} book={book} onBookClick={onBookClick} />
			))}
		</div>
	);
};
