interface MainButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

interface AnchorButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  className?: string;
  href: string;
}

export const MainButton = ({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  title,
  ...props
}: MainButtonProps) => {
  return (
    <button
      {...props}
      onClick={onClick}
      type={type}
      title={title}
      disabled={disabled}
      className={`bg-secondary-200 text-black-200 font-recursive text-sm rounded-full px-7 py-3 border-[3px] border-black-200 shadow-[2px_2px_0_0_black] transition-all duration-200 font-medium ${className} hover:scale-105`}
    >
      {children}
    </button>
  );
};

export const MainButton2 = ({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  ...props
}: MainButtonProps) => {
  return (
    <button
      {...props}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`bg-black/10 text-white font-recursive text-sm rounded-full px-7 py-3 border border-black/70 shadow-[2px_2px_0_0_black] transition-all duration-200 font-medium ${className} hover:scale-105`}
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
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: AnchorButtonProps) => {
  return (
    <a
      {...props}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={`cursor-pointer bg-secondary-200 text-black-200 font-recursive text-sm rounded-full px-7 py-3 border-[3px] border-black-200 shadow-[2px_2px_0_0_black] transition-all duration-200 font-medium ${className} hover:scale-105`}
    >
      {children}
    </a>
  );
};


export const SecondaryAnchorButton = ({
  children,
  onClick,
  className = "",
  href = "#",
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: AnchorButtonProps) => {
  return (
    <a
      {...props}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={`bg-black/10 text-white font-recursive text-sm rounded-full px-7 py-3 border border-black/70 shadow-[2px_2px_0_0_black] transition-all duration-200 font-medium ${className} hover:scale-105`}
    >
      {children}
    </a>
  );
};

export const GradientButton = ({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  ...props
}: MainButtonProps) => {
  return (
    <button
      {...props}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`bg-secondary-300 disabled:bg-secondary-300/50 disabled:cursor-not-allowed text-black font-bold rounded-xl shadow-lg transition-none ${className}`}
    >
      {children}
    </button>
  );
};

export const OrangeButton = ({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  ...props
}: MainButtonProps) => {
  return (
    <button
      {...props}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`bg-secondary-300 disabled:bg-secondary-300/50 disabled:cursor-not-allowed text-black font-bold rounded-xl shadow-lg transition-none ${className}`}
    >
      {children}
    </button>
  );
};
