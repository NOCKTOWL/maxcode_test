"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaBars, FaBookOpen } from "react-icons/fa6";
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
  const activeTheme = theme ?? "system";

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

  const handleSurahToggle = () => {
    window.dispatchEvent(new CustomEvent("surah-sidebar-toggle"));
  };

  const handleSettingsToggle = () => {
    window.dispatchEvent(new CustomEvent("settings-panel-toggle"));
  };

  return (
    <nav
      className={`sticky ml-15 top-0 z-50 border-b border-border-color bg-background transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className=" flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {showSurahToggle && (
            <button
              type="button"
              onClick={handleSurahToggle}
              className="inline-flex items-center justify-center rounded-full border border-zinc-800/80 bg-zinc-900/70 p-2 text-primary transition hover:border-amber-200/30 hover:text-primary md:hidden"
              aria-label="Toggle surah list"
            >
              <FaBars />
            </button>
          )}
          <Link
            href="/"
            className="group flex items-center gap-2 py-2 text-sm font-semibold text-primary transition hover:border-amber-200/30"
          >
            <div className="flex flex-col">
              <span className=" text-lg text-primary md:inline-block">
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

        <div className="flex flex-1 items-center justify-end gap-3">
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

          <div className="relative">
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
              <Image
                src="/assets/darkMode.svg"
                alt="Theme"
                width={16}
                height={16}
                className="text-primary"
              />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl bg-background p-1 text-sm text-primary shadow-lg">
                {["light", "dark", "sepia", "system"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setTheme(value);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition hover:bg-secondary-foreground ${
                      activeTheme === value
                        ? "bg-secondary-foreground text-primary"
                        : "text-primary"
                    }`}
                  >
                    <span className="capitalize">{value}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSettingsToggle}
            className="inline-flex lg:hidden items-center gap-2 rounded-full bg-accent-green/10 px-3 py-2 text-sm font-semibold text-primary transition hover:border-amber-200/30 hover:text-primary"
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
            className="flex justfy-center gap-2 items-center rounded-full bg-accent-green px-4 py-2 text-sm font-semibold text-primary"
          >
            <span>Support Us</span>
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
