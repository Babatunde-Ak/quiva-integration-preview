import Image from 'next/image'

interface HbarIconProps {
  size?: number
  className?: string
}

export function HbarIcon({ size = 16, className = '' }: HbarIconProps) {
  return (
    <Image
      src="/hbar.png"
      alt="HBAR"
      width={size}
      height={size}
      className={`inline-block object-contain flex-shrink-0 ${className}`}
    />
  )
}
