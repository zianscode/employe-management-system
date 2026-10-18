"use client";

import React from "react";
import Link from "next/link";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

interface MenuItemProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  hasChildren?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  isCollapsed?: boolean;
}

export const MenuItem = ({
  href,
  label,
  icon,
  isActive,
  hasChildren,
  onClick,
  children,
  isCollapsed,
}: MenuItemProps) => {
  const activeClasses = `
    bg-gradient-to-r from-[#FF5A57]/10 via-[#E02F75]/10 to-[#6700A3]/10
    text-gray-900 ${isCollapsed ? "border-none" : "border-r-4 border-[#FF5A57]"} shadow-sm
  `;

  const inactiveClasses = `
    text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 
    hover:text-gray-900 hover:shadow-sm
  `;

  const linkClasses = `
    flex items-center rounded-xl py-3 px-4 text-[15px] font-semibold 
    transition-all duration-300 ease-in-out group relative
    ${isCollapsed ? "justify-center px-0 mx-2" : "gap-3"}
    ${isActive ? activeClasses : inactiveClasses}
  `;

  if (hasChildren && !isCollapsed) {
    return (
      <div className="mb-1">
        <button
          type="button"
          onClick={onClick}
          className={`${linkClasses} w-full justify-between`}
        >
          <span className="flex items-center gap-3">
            <span
              className={`text-[20px] flex-shrink-0 transition-colors duration-200 ${
                isActive
                  ? "text-[#FF5A57]"
                  : "text-gray-400 group-hover:text-gray-600"
              }`}
            >
              {icon}
            </span>
            <span
              className={`capitalize ${
                isActive
                  ? "text-gray-900 font-bold"
                  : "group-hover:text-gray-900"
              }`}
            >
              {label}
            </span>
          </span>
          <span
            className={`transition-transform duration-200 ${
              isActive
                ? "text-[#FF5A57]"
                : "text-gray-400 group-hover:text-gray-600"
            }`}
          >
            {isActive ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
          </span>
        </button>
        <div className={`ml-4 mt-1 space-y-1 ${isActive ? "block" : "hidden"}`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-1 px-2">
      <Link href={href} className={linkClasses} title={isCollapsed ? label : ""}>
        <span
          className={`text-[22px] flex-shrink-0 transition-all duration-300 ${
            isActive
              ? "text-[#E02F75] scale-110"
              : "text-gray-400 group-hover:text-gray-600 group-hover:scale-110"
          }`}
        >
          {icon}
        </span>
        {!isCollapsed && (
          <span
            className={`capitalize whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isActive
                ? "text-gray-900 font-bold"
                : "group-hover:text-gray-900 font-semibold"
            }`}
          >
            {label}
          </span>
        )}
        {isActive && !isCollapsed && (
          <div className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-gradient-to-b from-[#FF5A57] via-[#E02F75] to-[#6700A3]"></div>
        )}
        {isActive && isCollapsed && (
          <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#FF5A57] via-[#E02F75] to-[#6700A3]"></div>
        )}
      </Link>
    </div>
  );
};
