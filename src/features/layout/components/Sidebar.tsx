"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { FaBars, FaTimes } from "react-icons/fa";
import Menu from "./Menu";
import { ROLES } from "@/shared/constants/roles";

export const Sidebar = () => {
  const { data: session } = useSession();
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
      {isMobile && (
        <button
          onClick={handleToggle}
          className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF5A57] via-[#E02F75] to-[#6700A3] text-white shadow-lg lg:hidden"
        >
          {isMobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      )}

      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={handleCloseMobile}
        />
      )}

      <div
        className={`relative flex-shrink-0 transition-all duration-300 ease-in-out ${
          isMobile ? "w-0" : isCollapsed ? "w-20" : "w-72"
        }`}
      >
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
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 text-2xl font-bold text-gray-800 transition-all duration-300 ${
                  isCollapsed && !isMobile ? "justify-center" : ""
                }`}
                onClick={handleCloseMobile}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5A57] via-[#E02F75] to-[#6700A3] text-white shadow-lg">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
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
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all duration-200 hover:bg-gradient-to-br hover:from-[#FF5A57] hover:via-[#E02F75] hover:to-[#6700A3] hover:text-white ${
                    isCollapsed ? "hidden" : ""
                  }`}
                >
                  <BiChevronLeft size={18} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-6">
              <div onClick={handleCloseMobile}>
                <Menu 
                  currentPath={asPath} 
                  isCollapsed={isCollapsed && !isMobile} 
                  role={session?.user?.role || ROLES.EMPLOYEE} 
                />
              </div>
            </div>

            {!isMobile && isCollapsed && (
              <div className="flex justify-center p-4">
                <button
                  onClick={handleToggle}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gradient-to-br hover:from-[#FF5A57] hover:via-[#E02F75] hover:to-[#6700A3] hover:text-white shadow-sm transition-all"
                >
                  <BiChevronRight size={24} />
                </button>
              </div>
            )}

            <Link href={"/dashboard/profile"}>
              <div className={`border-t border-gray-100 ${isCollapsed && !isMobile ? "p-2" : "p-4"}`}>
                <div
                  className={`flex items-center rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 transition-all duration-300 ${
                    isCollapsed && !isMobile ? "justify-center p-2" : "gap-3 p-3"
                  }`}
                >
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-[#FF5A57] via-[#E02F75] to-[#6700A3] flex items-center justify-center text-white text-sm font-black shadow-md border-2 border-white uppercase tracking-tighter overflow-hidden relative">
                    {session?.user?.image ? (
                      <Image 
                        src={session.user.image} 
                        alt={session.user.name || "Avatar"} 
                        fill
                        className="object-cover"
                        unoptimized
                        priority
                      />
                    ) : (
                      <span className="relative z-10">
                        {session?.user?.name 
                          ? session.user.name.split(" ").map(n => n[0]).join("").substring(0, 2)
                          : "SA"}
                      </span>
                    )}
                  </div>
                  {!(isCollapsed && !isMobile) && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {session?.user?.name || "Memuat..."}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session?.user?.email || "..."}
                      </p>
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
