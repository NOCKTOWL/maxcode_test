"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaBars } from "react-icons/fa6";
import { useNavbarVisibility } from "./NavbarVisibilityContext";
import { useTheme } from "next-themes";

// const NAV_LINKS = [
//   { label: "Quran", href: "/", icon: FaBookOpen },
//   { label: "Audio", href: "/audio", icon: FaHeadphones },
//   { label: "Tafsir", href: "/tafsir", icon: FaRegCirclePlay },
//   { label: "Dua", href: "/dua", icon: FaStarAndCrescent },
// ];

const Navbar = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const showSurahToggle = pathname?.startsWith("/surah/");
  const { isVisible, setIsVisible } = useNavbarVisibility();
  const lastScrollY = useRef(0);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY < 80) {
        setIsVisible(true);
      } else if (delta > 8) {
        setIsVisible(false);
      } else if (delta < -8) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [setIsVisible]);

  useEffect(() => {
    if (!isThemeMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!themeMenuRef.current) {
        return;
      }

      if (!themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isThemeMenuOpen]);

  const handleSurahToggle = () => {
    window.dispatchEvent(new CustomEvent("surah-sidebar-toggle"));
  };

  const handleSettingsToggle = () => {
    window.dispatchEvent(new CustomEvent("settings-panel-toggle"));
  };

  return (
    <nav
      className={`sticky top-0 z-50  bg-background transition-transform duration-300 ${pathname === "/" ? "" : "md:ml-15 border-b border-border-color"} ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        className={`flex items-center gap-4 px-4 py-2 md:py-0 sm:px-6 lg:px-10 ${pathname === "/" ? "justify-around" : "justify-between"}`}
      >
        <div className="flex items-center justify-center gap-3">
          {pathname === "/" && (
            <Image
              src="/assets/icon.svg"
              alt="Logo"
              width={36}
              height={36}
              className="text-primary"
            />
          )}
          {showSurahToggle && (
            <button
              type="button"
              onClick={handleSurahToggle}
              className="inline-flex items-center justify-center rounded-full bg-accent-green/10 p-2 text-accent-green md:hidden"
              aria-label="Toggle surah list"
            >
              <FaBars />
            </button>
          )}
          <Link
            href="/"
            className="group flex items-center gap-2 py-2 text-sm text-primary transition hover:border-amber-200/30"
          >
            <div className="flex flex-col">
              <span className=" text-lg text-primary md:inline-block font-bold">
                Quran Mazid
              </span>
              <span className="hidden text-[10px] text-secondary-text md:inline-block">
                Read, Study and Learn The Quran
              </span>
            </div>
          </Link>
        </div>

        {/* <nav className="hidden items-center gap-2 lg:flex">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="group inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-primary transition hover:border-zinc-800 hover:bg-zinc-900/70 hover:text-primary"
            >
              <Icon className="text-sm text-primary/70 group-hover:text-primary" />
              {label}
            </Link>
          ))}
        </nav> */}

        <div className="flex items-center justify-end gap-3">
          {pathname !== "/" && (
            <button
              type="button"
              className="group relative inline-flex items-center rounded-full bg-accent-green/10 p-2 text-sm font-semibold text-primary transition hover:border-amber-200/30 hover:text-primary"
            >
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900/90 px-3 py-2 text-xs font-semibold text-background opacity-0 transition duration-200 group-hover:-translate-y-1 group-hover:opacity-100">
                Search
              </span>
              <Image
                src="/assets/search.svg"
                alt="Search"
                width={16}
                height={16}
                className="text-primary"
              />
            </button>
          )}

          <div className="relative" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen((prev) => !prev)}
              className="group relative inline-flex items-center rounded-full bg-accent-green/10 p-2 text-sm font-semibold text-primary transition hover:border-amber-200/30 hover:text-primary"
              aria-haspopup="menu"
              aria-expanded={isThemeMenuOpen}
              aria-label="Theme options"
            >
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900/90 px-3 py-2 text-xs font-semibold text-background opacity-0 transition duration-200 group-hover:-translate-y-1 group-hover:opacity-100">
                Theme
              </span>
              <span
                aria-hidden="true"
                className="inline-block h-4 w-4 bg-accent-green"
                style={{
                  maskImage: `url(/assets/${localStorage.getItem("theme") || "system"}Mode.svg)`,
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskImage: `url(/assets/${localStorage.getItem("theme") || "system"}Mode.svg)`,
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  WebkitMaskSize: "contain",
                }}
              />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-32 rounded-xl bg-background p-1 text-base text-primary shadow-lg">
                {["light", "dark", "sepia", "system"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setTheme(value);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-start rounded-lg gap-2 p-3 text-left transition hover:bg-secondary-foreground ${
                      localStorage.getItem("theme") === value
                        ? "bg-secondary-foreground text-primary"
                        : "text-primary"
                    }`}
                  >
                    <Image
                      src={`/assets/${value}Mode.svg`}
                      alt={value}
                      width={16}
                      height={16}
                    />
                    <span className="capitalize">{value}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSettingsToggle}
            className={`inline-flex items-center gap-2 rounded-full bg-accent-green/10 p-2 text-sm font-semibold text-primary transition hover:border-amber-200/30 hover:text-primary ${pathname === "/" ? "" : "lg:hidden"}`}
            aria-label="Toggle settings"
          >
            <Image
              src="/assets/settings.svg"
              alt="Settings"
              width={16}
              height={16}
              className="text-primary"
            />
          </button>

          <Link
            href="/donate"
            className="hidden md:flex justify-center gap-2 items-center rounded-full bg-accent-green px-4 py-2 text-sm font-medium text-primary"
          >
            <span className="text-background">Support Us</span>
            <Image
              src="/assets/hearts.svg"
              alt="Heart"
              width={16}
              height={16}
              className="ml-1 text-primary"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
