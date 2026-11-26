import React from "react";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group";
import { cn } from "@/shared/utils/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <InputGroup className={cn("sm:max-w-xs", className)}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </InputGroup>
  );
}

interface FilterBarProps {
  search?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function FilterBar({ search, children, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center", className)}>
      {search && <div className="flex-1">{search}</div>}
      {children && <div className="grid grid-cols-2 gap-3 sm:flex">{children}</div>}
    </div>
  );
}
