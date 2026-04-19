"use client";

import { useEffect, useState } from "react";
import { FaChevronUp } from "react-icons/fa6";

export default function ScrollToTopButton() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const shouldShow = window.scrollY > 500;
      setShowScrollTop((prev) => (prev !== shouldShow ? shouldShow : prev));
    };

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkIfMobile);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-4 right-4 rounded-full bg-amber-100/10 p-3 md:px-4 md:py-2 text-xl md:text-sm font-semibold text-amber-100 transition-all duration-300 ${
        showScrollTop
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      {isMobile ? <FaChevronUp /> : "Scroll to top"}
    </button>
  );
}
