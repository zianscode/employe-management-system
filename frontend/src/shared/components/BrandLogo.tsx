import Image from "next/image";
import { cn } from "@/shared/utils/cn";

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
      className={cn("dark:rounded-md dark:bg-white dark:p-0.5", className)}
      priority
    />
  );
}
