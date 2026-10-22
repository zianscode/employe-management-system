import React from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-medium text-brand",
        SIZES[size],
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={name || "Avatar"} fill className="object-cover" unoptimized />
      ) : name ? (
        getInitials(name)
      ) : (
        <UserRound className="h-1/2 w-1/2" />
      )}
    </div>
  );
}
