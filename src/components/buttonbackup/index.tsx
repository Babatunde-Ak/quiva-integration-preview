interface MainButtonProps {
	children: React.ReactNode;
	onClick?: () => void;
	className?: string;
	type?: "button" | "submit";
}

export const MainButton = ({
	children,
	onClick,
	className = "",
	type = "button",
}: MainButtonProps) => {
	return (
		<button
			onClick={onClick}
			type={type}
			className={`bg-secondary-200 text-black-200 font-recursive text-sm rounded-full px-7 py-3 border-[3px] border-black-200 shadow-[2px_2px_0_0_black] transition-all duration-200 font-medium ${className} hover:scale-105 transition-[.4]`}
		>
			{children}
		</button>
	);
};

export const MainButton2 = ({
	children,
	onClick,
	className = "",
}: MainButtonProps) => {
	return (
		<button
			onClick={onClick}
			className={`bg-secondary-200 text-white font-recursive text-sm rounded-full px-7 py-3 border-[3px] border-white shadow-[2px_2px_0_0_black] transition-all duration-200 font-medium ${className} hover:scale-105 transition-[.4]`}
		>
			{children}
		</button>
	);
};

export const AnchorButton = ({
	children,
	onClick,
	className = "",
	href = "#",
}: MainButtonProps & { href: string }) => {
	return (
		<a
			href={href}
			target='_blank'
			rel='noopener noreferrer'
			onClick={onClick}
			className={`cursor-pointer bg-secondary-200 text-black-200 font-recursive text-sm rounded-full px-7 py-3 border-[3px] border-black-200 shadow-[2px_2px_0_0_black] transition-all duration-200 font-medium ${className} hover:scale-105 transition-[.4]`}
		>
			{children}
		</a>
	);
};