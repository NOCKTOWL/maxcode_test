"use client";

import ScrollToTopButton from "@/app/components/ScrollToTopButton";
import { useNavbarVisibility } from "@/app/components/NavbarVisibilityContext";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

// ICON IMPORTS

type SurahData = {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  surahNo: number;
  english: string[];
  bengali: string[];
  arabic1: string[];
};

type TranslationLanguage = "english" | "bengali";
type ArabicFontOption = "amiri" | "noto-naskh-arabic" | "rubik";

const FontClasses = {
  amiri: "font-amiri",
  "noto-naskh-arabic": "font-noto-naskh-arabic",
  rubik: "font-rubik",
};

type ReaderSettings = {
  arabicFont: ArabicFontOption;
  arabicFontSize: number;
  translationFontSize: number;
};

type AyahItem = {
  ayah: string;
  index: number;
  translation: string;
};

type SurahSummary = {
  surahName: string;
  surahNameArabic: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  surahNo: number;
};

const SETTINGS_STORAGE_KEY = "surah-settings";

const DEFAULT_SETTINGS: ReaderSettings = {
  arabicFont: "amiri",
  arabicFontSize: 46,
  translationFontSize: 21,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalizeSettings = (raw: Partial<ReaderSettings>): ReaderSettings => ({
  arabicFont:
    raw.arabicFont === "noto-naskh-arabic" || raw.arabicFont === "rubik"
      ? raw.arabicFont
      : "amiri",
  arabicFontSize: clamp(
    raw.arabicFontSize ?? DEFAULT_SETTINGS.arabicFontSize,
    28,
    72,
  ),
  translationFontSize: clamp(
    raw.translationFontSize ?? DEFAULT_SETTINGS.translationFontSize,
    14,
    40,
  ),
});

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SurahPageClient = ({
  surahData,
  surahList = [],
}: {
  surahData: SurahData;
  surahList?: SurahSummary[];
}) => {
  const [language, setLanguage] = useState<TranslationLanguage>("english");
  const [searchQuery, setSearchQuery] = useState("");
  const [surahSearchQuery, setSurahSearchQuery] = useState("");
  const [isSurahListOpen, setIsSurahListOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isVisible: isNavbarVisible } = useNavbarVisibility();
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS;
    }
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        return normalizeSettings(parsedSettings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (settingsError) {
      console.error("Failed to save settings:", settingsError);
    }
  }, [settings]);

  useEffect(() => {
    const handleToggle = () => {
      setIsSurahListOpen((prev) => !prev);
    };

    window.addEventListener("surah-sidebar-toggle", handleToggle);

    return () => {
      window.removeEventListener("surah-sidebar-toggle", handleToggle);
    };
  }, []);

  useEffect(() => {
    const handleSettingsToggle = () => {
      setIsSettingsOpen((prev) => !prev);
    };

    window.addEventListener("settings-panel-toggle", handleSettingsToggle);

    return () => {
      window.removeEventListener("settings-panel-toggle", handleSettingsToggle);
    };
  }, []);

  const translationLines =
    language === "english"
      ? (surahData?.english ?? [])
      : (surahData?.bengali ?? []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const normalizedSurahQuery = surahSearchQuery.trim().toLowerCase();

  const ayahs: AyahItem[] = (surahData?.arabic1 ?? []).map((ayah, index) => ({
    ayah,
    index,
    translation: translationLines[index] ?? "Translation unavailable",
  }));

  const filteredAyahs =
    normalizedQuery.length === 0
      ? ayahs
      : ayahs.filter((item) =>
          item.translation.toLowerCase().includes(normalizedQuery),
        );

  const filteredSurahList =
    normalizedSurahQuery.length === 0
      ? surahList
      : surahList.filter((surah) => {
          const searchable =
            `${surah.surahName} ${surah.surahNameTranslation} ${surah.surahNameArabic}`.toLowerCase();
          return searchable.includes(normalizedSurahQuery);
        });

  const highlightSearchTerm = (text: string) => {
    if (!normalizedQuery) return text;

    const regex = new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === normalizedQuery ? (
        <mark
          key={`${part}-${index}`}
          className="rounded bg-amber-300/25 px-1 text-primary"
        >
          {part}
        </mark>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      ),
    );
  };

  return (
    <div className="min-h-screen  pl-15 pr-0 text-primary lg:pl-87 lg:pr-80">
      {/* <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(70%_45%_at_50%_0%,rgba(251,191,36,0.08)_0%,rgba(9,9,11,0)_70%)]" /> */}

      <aside className="fixed left-0 top-0 z-50 flex h-screen w-15 flex-col items-center gap-6 border-r border-zinc-800/80 py-6">
        <Link
          href="/"
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-2 text-primary transition hover:border-amber-200/30 hover:text-primary"
          aria-label="Home"
        >
          <Image src="/assets/home.svg" alt="Home" width={20} height={20} />
        </Link>
        <button
          type="button"
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-2 text-primary transition hover:border-amber-200/30 hover:text-primary"
          aria-label="Read Quran"
        >
          <Image
            src="/assets/readQuran.svg"
            alt="Read Quran"
            width={20}
            height={20}
          />
        </button>
        <button
          type="button"
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-2 text-primary transition hover:border-amber-200/30 hover:text-primary"
          aria-label="Go to ayah"
        >
          <Image
            src="/assets/goToAyah.svg"
            alt="Go to ayah"
            width={20}
            height={20}
          />
        </button>
        <button
          type="button"
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-3 text-primary transition hover:border-amber-200/30 hover:text-primary"
          aria-label="Bookmark"
        >
          <Image
            src="/assets/bookmark.svg"
            alt="Bookmarks"
            width={20}
            height={20}
          />
        </button>
        <button
          type="button"
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-3 text-primary transition hover:border-amber-200/30 hover:text-primary"
          aria-label="Others"
        >
          <Image src="/assets/others.svg" alt="Others" width={20} height={20} />
        </button>
      </aside>

      {isSurahListOpen && (
        <button
          type="button"
          aria-label="Close surah list"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setIsSurahListOpen(false)}
        />
      )}

      <aside
        className={`fixed left-15 top-0 z-40 flex h-screen w-72 flex-col border-r border-zinc-800/80 transition-transform duration-300 lg:translate-x-0 ${isNavbarVisible ? "translate-y-15" : "translate-y-0"} ${
          isSurahListOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-zinc-800/80 px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Surah List
          </p>
          <input
            type="text"
            value={surahSearchQuery}
            onChange={(event) => setSurahSearchQuery(event.target.value)}
            placeholder="Search Surah"
            className="mt-3 w-full rounded-full bg-secondary-foreground px-4 py-2 text-sm text-primary outline-none placeholder:text-primary focus:border-amber-200/40"
          />
        </div>
        <div
          className="surah-scroll flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-4"
          data-lenis-prevent
        >
          {filteredSurahList.map((surah) => (
            <Link
              key={surah.surahNo}
              href={`/surah/${surah.surahNo}`}
              className={`group min-w-50 flex items-center justify-between gap-8 rounded-xl border px-3 py-4 text-sm transition ${
                surah.surahNo === surahData?.surahNo
                  ? "border-accent-green/30 bg-accent-green/10 text-primary"
                  : "border-transparent text-primary hover:border-zinc-800 hover:bg-accent-green/10"
              }`}
            >
              <div
                className={`ml-4 relative flex justify-center items-center text-sm font-semibold group-hover:text-primary ${surah.surahNo === surahData?.surahNo ? "text-primary" : "text-[#787d7a]"}  `}
              >
                <span className="z-5">{surah.surahNo}</span>
                <span
                  className={`z-0 absolute size-8 rotate-45 text-lg font-semibold text-primary rounded-sm group-hover:bg-accent-green ${surah.surahNo === surahData?.surahNo ? "bg-accent-green" : "bg-surah-list-num-bg"}`}
                />
              </div>
              <span className="flex-1">
                <span className="block font-semibold text-primary">
                  {surah.surahName}
                </span>
                <span className="block text-xs text-primary">
                  {surah.surahNameTranslation}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </aside>

      {isSettingsOpen && (
        <button
          type="button"
          aria-label="Close settings"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setIsSettingsOpen(false)}
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-40 flex h-screen w-80 flex-col gap-6 border-l border-zinc-800/80 p-5 transition-transform duration-300 lg:translate-x-0 ${isNavbarVisible ? "translate-y-15" : "translate-y-0"} ${
          isSettingsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Translation
          </p>
          <div className="mt-3 inline-flex items-center rounded-full border border-zinc-700  p-1">
            <button
              type="button"
              onClick={() => setLanguage("english")}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                language === "english"
                  ? "bg-amber-100/10 text-primary"
                  : "text-primary hover:text-primary"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("bengali")}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                language === "bengali"
                  ? "bg-amber-100/10 text-primary"
                  : "text-primary hover:text-primary"
              }`}
            >
              Bangla
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Search Translation
          </p>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search in translation..."
            className="mt-3 w-full rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm text-primary outline-none placeholder:text-primary focus:border-amber-200/40"
          />
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">
              Reader Settings
            </h2>
          </div>

          <div>
            <label
              htmlFor="arabic-font"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Arabic Font
            </label>
            <select
              id="arabic-font"
              value={settings.arabicFont}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  arabicFont: event.target.value as ArabicFontOption,
                }))
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-primary outline-none focus:border-amber-200/40 cursor-pointer"
            >
              <option value="amiri">Amiri Font</option>
              <option value="noto-naskh-arabic">Naskh Font</option>
              <option value="rubik">Rubik Font</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">
              Arabic Font Size: {settings.arabicFontSize}px
            </label>
            <input
              type="range"
              min={28}
              max={72}
              step={1}
              value={settings.arabicFontSize}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  arabicFontSize: Number(event.target.value),
                }))
              }
              className="w-full accent-amber-300 cursor-pointer"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-primary">
              Translation Font Size: {settings.translationFontSize}px
            </label>
            <input
              type="range"
              min={14}
              max={40}
              step={1}
              value={settings.translationFontSize}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  translationFontSize: Number(event.target.value),
                }))
              }
              className="w-full accent-amber-300 cursor-pointer"
            />
          </div>
        </div>
      </aside>

      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-4 lg:px-8 lg:pb-24 lg:pt-12">
        <div className="mb-6 flex items-center gap-2">
          <Link
            href="/"
            className="cursor-pointer rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-primary transition hover:border-amber-200/30 hover:text-primary"
          >
            Back
          </Link>
        </div>

        {surahData && (
          <>
            <header className="mb-10 border-b border-amber-200/15 pb-8 lg:mb-12 lg:pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Surah {surahData.surahNo}
              </p>

              <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
                <div>
                  <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                    {surahData.surahName}
                  </h1>
                  <p className="mt-3 text-base text-primary sm:text-lg">
                    {surahData.surahNameTranslation}
                  </p>
                </div>

                <p
                  className="text-right text-3xl leading-relaxed text-primary sm:text-4xl lg:text-5xl"
                  dir="rtl"
                  lang="ar"
                >
                  {surahData.surahNameArabicLong}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-1.5 font-semibold text-primary">
                  {surahData.totalAyah} Ayahs
                </span>
                <span className="rounded-full border border-zinc-700 px-3 py-1.5 text-primary">
                  {surahData.revelationPlace}
                </span>
              </div>
            </header>

            <div className="space-y-10">
              {filteredAyahs.length === 0 && (
                <p className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-6 text-center text-sm text-primary">
                  No ayah found for this search query.
                </p>
              )}

              {filteredAyahs.map(({ ayah, index, translation }) => (
                <article
                  key={index}
                  className="border-b border-zinc-800/90 pb-10"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center  font-bold text-green">
                      {surahData.surahNo}:{index + 1}
                    </span>
                  </div>

                  <p
                    className={`text-right leading-[2.25] text-primary ${FontClasses[settings.arabicFont]} `}
                    dir="rtl"
                    lang="ar"
                    style={{
                      fontSize: `${settings.arabicFontSize}px`,
                    }}
                  >
                    {ayah}
                  </p>

                  <p
                    className="mx-auto mt-6 max-w-4xl text-left leading-8 text-primary"
                    style={{ fontSize: `${settings.translationFontSize}px` }}
                  >
                    {highlightSearchTerm(translation)}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
      <ScrollToTopButton />
    </div>
  );
};

export default SurahPageClient;
