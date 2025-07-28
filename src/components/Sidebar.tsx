// Sidebar.tsx - Updated Version
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { FaBars, FaTimes } from "react-icons/fa";

import Menu from "@/components/Menu";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const asPath = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleCloseMobile = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={handleToggle}
          className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF5A57] via-[#E02F75] to-[#6700A3] text-white shadow-lg lg:hidden"
        >
          {isMobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={handleCloseMobile}
        />
      )}

      {/* Sidebar */}
      <div
        className={`relative flex-shrink-0 transition-all duration-300 ease-in-out ${
          isMobile ? "w-0" : isCollapsed ? "w-24" : "w-72"
        }`}
      >
        {/* Fixed Sidebar Content */}
        <div
          className={`fixed top-4 left-4 h-[96vh] rounded-2xl bg-white border border-gray-200 shadow-xl transition-all duration-300 ease-in-out z-40 ${
            isMobile
              ? `${isMobileOpen ? "translate-x-0" : "-translate-x-full"} w-72`
              : isCollapsed
              ? "w-20"
              : "w-72"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 text-2xl font-bold text-gray-800 transition-all duration-300 ${
                  isCollapsed && !isMobile ? "justify-center" : ""
                }`}
                onClick={handleCloseMobile}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5A57] via-[#E02F75] to-[#6700A3] text-white shadow-lg">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                {!(isCollapsed && !isMobile) && (
                  <span className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] bg-clip-text text-transparent font-extrabold">
                    EMS
                  </span>
                )}
              </Link>

              {!isMobile && (
                <button
                  type="button"
                  onClick={handleToggle}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all duration-200 hover:bg-gradient-to-br hover:from-[#FF5A57] hover:via-[#E02F75] hover:to-[#6700A3] hover:text-white ${
                    isCollapsed ? "ml-2" : ""
                  }`}
                >
                  {isCollapsed ? (
                    <BiChevronRight size={18} />
                  ) : (
                    <BiChevronLeft size={18} />
                  )}
                </button>
              )}
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto py-6">
              {!(isCollapsed && !isMobile) ? (
                <div onClick={handleCloseMobile}>
                  <Menu
                    isOpen={true}
                    onToggle={handleToggle}
                    currentPath={asPath}
                  />
                </div>
              ) : (
                <div className="space-y-2 px-2">
                  <div className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Menu
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <Link href={"/dashboard/profile"}>
              <div className="border-t border-gray-100 p-4">
                <div
                  className={`flex items-center gap-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-3 ${
                    isCollapsed && !isMobile ? "justify-center" : ""
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#FF5A57] via-[#E02F75] to-[#6700A3] flex items-center justify-center text-white text-sm font-bold">
                    A
                  </div>
                  {!(isCollapsed && !isMobile) && (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        Admin User
                      </p>
                      <p className="text-xs text-gray-500">admin@company.com</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
