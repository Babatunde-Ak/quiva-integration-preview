interface AuthTitleProps {
	title: string;
	desc?: string;
	className?: string;
	titleClassName?: string;
}
export const AuthTitle = ({
	title,
	desc,
	className,
	titleClassName,
}: AuthTitleProps) => {
	return (
		<div className={`${className} mx-auto text-center w-fit`}>
			<h3 className={`text-2xl font-medium text-primary-100 ${titleClassName}`}>
				{title}
			</h3>
			<span className='text-gray-500 text-sm text-center'>
				Enter your email for verification
			</span>
		</div>
	);
};
