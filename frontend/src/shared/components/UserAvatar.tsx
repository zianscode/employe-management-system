import React from "react";
import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/utils/cn";

const SIZE_CLASSES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
};

const COLOR_CLASSES = [
  "bg-primary/10 text-primary",
  "bg-success/10 text-success",
  "bg-info/10 text-info",
  "bg-warning/10 text-warning",
];

function colorFor(name?: string | null) {
  if (!name) return "bg-muted text-muted-foreground";
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COLOR_CLASSES[hash % COLOR_CLASSES.length];
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface UserAvatarProps {
  name?: string | null;
  src?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function UserAvatar({ name, src, size = "md", className }: UserAvatarProps) {
  return (
    <Avatar className={cn(SIZE_CLASSES[size], className)}>
      {src && <AvatarImage src={src} alt={name || "Foto profil"} />}
      <AvatarFallback className={cn("font-medium", colorFor(name))}>
        {name ? initialsOf(name) : <UserRound className="size-1/2" />}
      </AvatarFallback>
    </Avatar>
  );
}
