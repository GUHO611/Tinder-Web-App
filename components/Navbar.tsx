"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useMessage } from "@/contexts/message-context";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";

// --- 1. CONFIG MÀU SẮC ROMANTIC ---
const NAV_ITEMS = [
  {
    label: "Khám Phá",
    href: "/matches",
    activeGradient: "from-rose-400 to-orange-400",
    hoverText: "group-hover:text-rose-500",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    )
  },
  {
    label: "Ghép Đôi",
    href: "/matches/list",
    activeGradient: "from-[#E94086] to-purple-500",
    hoverText: "group-hover:text-[#E94086]",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    )
  },
  {
    label: "Tin Nhắn",
    href: "/chat",
    activeGradient: "from-violet-500 to-fuchsia-500",
    hoverText: "group-hover:text-violet-500",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    )
  },
  {
    label: "Hồ Sơ",
    href: "/profile",
    activeGradient: "from-pink-400 to-rose-400",
    hoverText: "group-hover:text-pink-500",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )
  },
];

// --- 2. COMPONENT NAVLINK ---
interface NavLinkProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  activeGradient: string;
  hoverText: string;
  onClick?: () => void;
  mobile?: boolean;
  isScrolled?: boolean;
  unreadCount?: number;
}

const NavLink = ({
  href,
  label,
  icon,
  activeGradient,
  hoverText,
  onClick,
  mobile = false,
  isScrolled = false,
  unreadCount = 0,
}: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  // --- MOBILE LINK ---
  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
          ? "bg-pink-50 dark:bg-white/5 shadow-sm border border-pink-100 dark:border-white/10"
          : "hover:bg-gray-50 dark:hover:bg-white/5"
          }`}
      >
        <div className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm relative ${isActive
          ? `bg-gradient-to-br ${activeGradient} text-white scale-110 shadow-pink-200`
          : `bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-300 ${hoverText} group-hover:scale-110 group-hover:shadow-md`
          }`}>
          {icon}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-[#E94086] text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold shadow-sm border-2 border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>

        <span className={`text-lg font-bold transition-colors duration-300 ${isActive
          ? `text-transparent bg-clip-text bg-gradient-to-r ${activeGradient}`
          : `text-gray-600 dark:text-gray-200 ${hoverText}`
          }`}>
          {label}
        </span>
      </Link>
    );
  }

  // --- DESKTOP LINK ---
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 group relative ${isActive
        ? "bg-white/80 dark:bg-white/10 shadow-[0_4px_20px_-2px_rgba(233,64,134,0.15)] border border-pink-100 dark:border-white/10 backdrop-blur-sm"
        : "hover:bg-white/60 dark:hover:bg-white/5 hover:shadow-sm"
        }`}
    >
      <div className={`p-1.5 rounded-lg transition-all duration-300 relative ${isActive
        ? `bg-gradient-to-br ${activeGradient} text-white shadow-md scale-105`
        : `bg-gray-50 dark:bg-gray-800 text-gray-400 ${hoverText} group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-gray-700`
        }`}>
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })
          : icon}

        {unreadCount > 0 && (
          <div className="absolute -top-1.5 -right-1.5 bg-[#E94086] text-white text-[10px] rounded-full min-w-[16px] h-[16px] flex items-center justify-center font-bold shadow-sm border border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>

      <span className={`font-bold text-sm xl:text-base transition-colors duration-300 ${isActive
        ? `text-transparent bg-clip-text bg-gradient-to-r ${activeGradient}`
        : `text-gray-600 dark:text-gray-300 ${hoverText}` // Sửa màu text-gray-900 thành gray-600 cho nhẹ hơn
        }`}>
        {label}
      </span>
    </Link>
  );
};

export default function Navbar() {
  const { signOut, user } = useAuth();
  const { unreadCount } = useMessage();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const logoRef = useRef<HTMLAnchorElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Animation & Events (Giữ nguyên) ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !hamburgerRef.current?.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, { x: -50, opacity: 0, duration: 1, ease: "power3.out" });
      if (navItemsRef.current) {
        gsap.from(navItemsRef.current.children, { y: -20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)", delay: 0.3 });
      }
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      gsap.to(mobileMenuRef.current, { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out", display: "block" });
    } else {
      gsap.to(mobileMenuRef.current, { height: 0, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => { if (mobileMenuRef.current) mobileMenuRef.current.style.display = "none"; } });
    }
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    // --- MAIN NAVBAR CONTAINER ---
    // SỬA: Thay bg-gray-900 (Đen) thành bg-[#1a0510] (Màu rượu vang tối) cho chế độ Dark Mode
    <nav className={`relative z-50 fixed w-full top-0 transition-all duration-300 ${isScrolled
      ? "bg-white/80 dark:bg-[#1a0510]/90 backdrop-blur-xl border-b border-pink-100 dark:border-white/10 shadow-sm"
      : "bg-white/40 dark:bg-[#1a0510]/40 backdrop-blur-md border-b border-transparent"
      }`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link
            href="/"
            ref={logoRef}
            className="flex items-center space-x-2 group z-50"
          >
            <div className="bg-gradient-to-tr from-[#E94086] to-[#FF99AC] p-1.5 rounded-xl text-white transform transition-transform group-hover:rotate-12 duration-300 shadow-lg shadow-pink-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-[#E94086] to-[#FF6B6B] bg-clip-text text-transparent tracking-tight">
              StreamMatch
            </span>
          </Link>

          {/* DESKTOP MENU */}
          {user && (
            <div
              ref={navItemsRef}
              className="hidden lg:flex items-center space-x-2 xl:space-x-4"
            >
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  isScrolled={isScrolled}
                  unreadCount={item.href === '/chat' ? unreadCount : 0}
                />
              ))}
            </div>
          )}

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:block">
              {user ? (
                // Sign Out Button
                <button
                  onClick={handleSignOut}
                  className="relative inline-flex items-center px-5 py-2 overflow-hidden font-medium transition-all bg-white dark:bg-white/10 rounded-full hover:bg-white group border border-pink-100 dark:border-white/10 hover:border-[#E94086] shadow-sm hover:shadow-md"
                >
                  <span className="w-48 h-48 rounded rotate-[-40deg] bg-[#E94086] absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0"></span>
                  <span className="relative w-full text-left text-gray-600 dark:text-gray-200 transition-colors duration-300 ease-in-out group-hover:text-white flex items-center text-sm font-bold">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Đăng xuất
                  </span>
                </button>
              ) : (
                // Login Button: SỬA LẠI MÀU CHỮ
                // Thay text-gray-900 (Đen) thành text-pink-600 để đồng bộ
                <Link
                  href="/auth"
                  className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-pink-600 rounded-full group bg-gradient-to-br from-[#E94086] to-[#FF99AC] group-hover:from-[#D63376] group-hover:to-[#FF5C9D] hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200"
                >
                  <span className="relative px-6 py-2 transition-all ease-in duration-75 bg-white dark:bg-[#1a0510] rounded-full group-hover:bg-opacity-0">
                    Đăng nhập
                  </span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            {user && (
              <button
                ref={hamburgerRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-500 dark:text-gray-300 hover:text-[#E94086] transition-colors rounded-xl hover:bg-pink-50 dark:hover:bg-white/10"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        ref={mobileMenuRef}
        className="lg:hidden overflow-hidden h-0 opacity-0 bg-white/95 dark:bg-[#1a0510]/95 backdrop-blur-xl border-b border-pink-100 dark:border-white/10 absolute w-full left-0 top-[79px] shadow-2xl rounded-b-3xl"
        style={{ display: "none" }}
      >
        <div className="container mx-auto px-4 py-6 flex flex-col space-y-3">
          {user && (
            <>
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  mobile
                  onClick={() => setIsMobileMenuOpen(false)}
                  unreadCount={item.href === '/chat' ? unreadCount : 0}
                />
              ))}

              <div className="h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent my-2 opacity-50"></div>

              <button
                onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-[#E94086] hover:bg-pink-50 dark:hover:bg-white/5 group w-full"
              >
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:text-[#E94086] group-hover:shadow-md transition-all shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <span className="text-lg font-bold">Đăng xuất</span>
              </button>
            </>
          )}

          {!user && (
            <Link
              href="/auth"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-center py-4 mt-2 bg-gradient-to-r from-[#E94086] to-[#FF99AC] text-white rounded-2xl font-bold shadow-lg shadow-pink-500/30 active:scale-95 transition-transform"
            >
              Đăng nhập ngay
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}