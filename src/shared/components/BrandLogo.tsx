import Image from "next/image";

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 40, className = "" }: BrandLogoProps) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt="Logo Employee Management System"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
