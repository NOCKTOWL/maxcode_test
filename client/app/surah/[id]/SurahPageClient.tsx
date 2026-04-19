"use client";

import ScrollToTopButton from "@/app/components/ScrollToTopButton";
import Link from "next/link";
import { useEffect, useState } from "react";

// ICON IMPORTS
import { FaGear } from "react-icons/fa6";

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
  naksh: "font-noto-naskh-arabic",
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

const SurahPageClient = ({ surahData }: { surahData: SurahData }) => {
  const [language, setLanguage] = useState<TranslationLanguage>("english");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const translationLines =
    language === "english"
      ? (surahData?.english ?? [])
      : (surahData?.bengali ?? []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

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

  const highlightSearchTerm = (text: string) => {
    if (!normalizedQuery) return text;

    const regex = new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === normalizedQuery ? (
        <mark
          key={`${part}-${index}`}
          className="rounded bg-amber-300/25 px-1 text-amber-50"
        >
          {part}
        </mark>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      ),
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(70%_45%_at_50%_0%,rgba(251,191,36,0.08)_0%,rgba(9,9,11,0)_70%)]" />

      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 pointer-events-auto"
          onClick={() => setIsSettingsOpen(false)}
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-80 border-l border-amber-200/20 bg-zinc-900/95 p-5 backdrop-blur transition-transform duration-300 ${
          isSettingsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Reader Settings</h2>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:text-zinc-100 cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="arabic-font"
              className="mb-2 block text-sm font-semibold text-zinc-200"
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
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-200/40 cursor-pointer"
            >
              <option value="amiri">Amiri Font</option>
              <option value="noto-naskh-arabic">Naskh Font</option>
              <option value="rubik">Rubik Font</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-200">
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
            <label className="mb-2 block text-sm font-semibold text-zinc-200">
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

      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:pb-24 lg:pt-12">
        <div className="mb-6 flex items-center gap-2">
          <Link
            href="/"
            className="cursor-pointer rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-amber-200/30 hover:text-amber-100"
          >
            Back
          </Link>
        </div>

        {surahData && (
          <>
            <header className="mb-10 border-b border-amber-200/15 pb-8 lg:mb-12 lg:pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/70">
                Surah {surahData.surahNo}
              </p>

              <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
                <div>
                  <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                    {surahData.surahName}
                  </h1>
                  <p className="mt-3 text-base text-zinc-400 sm:text-lg">
                    {surahData.surahNameTranslation}
                  </p>
                </div>

                <p
                  className="text-right text-3xl leading-relaxed text-amber-100 sm:text-4xl lg:text-5xl"
                  dir="rtl"
                  lang="ar"
                >
                  {surahData.surahNameArabicLong}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-1.5 font-semibold text-amber-100">
                  {surahData.totalAyah} Ayahs
                </span>
                <span className="rounded-full border border-zinc-700 px-3 py-1.5 text-zinc-300">
                  {surahData.revelationPlace}
                </span>
              </div>
            </header>

            <div className="sticky top-3 z-10 mb-8 flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/85 px-3 py-3 backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 justify-evenly md:justify-start">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Translation
                </p>

                <div className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/70 p-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("english")}
                    className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                      language === "english"
                        ? "bg-amber-100/10 text-amber-100"
                        : "text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("bengali")}
                    className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                      language === "bengali"
                        ? "bg-amber-100/10 text-amber-100"
                        : "text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    Bangla
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="md:hidden cursor-pointer rounded-full border border-zinc-700 bg-zinc-900/70 p-3 text-sm font-semibold text-zinc-600 transition hover:border-amber-200/30 hover:text-amber-100"
                >
                  <FaGear />
                </button>
              </div>

              <div className="flex flex-col gap-2 md:w-md md:flex-row md:items-center md:justify-end">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search in translation..."
                  className="w-full rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-amber-200/40 md:max-w-xs"
                />
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="hidden md:inline-block cursor-pointer rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-amber-200/30 hover:text-amber-100"
                >
                  Settings
                </button>
              </div>
            </div>

            <div className="space-y-10">
              {filteredAyahs.length === 0 && (
                <p className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-6 text-center text-sm text-zinc-400">
                  No ayah found for this search query.
                </p>
              )}

              {filteredAyahs.map(({ ayah, index, translation }) => (
                <article
                  key={index}
                  className="border-b border-zinc-800/90 pb-10"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/30 bg-amber-100/10 text-xs font-bold text-amber-100">
                      {index + 1}
                    </span>
                    <div className="h-px flex-1 bg-zinc-800" />
                  </div>

                  <p
                    className={`text-right leading-[2.25] text-zinc-50 ${FontClasses[settings.arabicFont]} `}
                    dir="rtl"
                    lang="ar"
                    style={{
                      fontSize: `${settings.arabicFontSize}px`,
                    }}
                  >
                    {ayah}
                  </p>

                  <p
                    className="mx-auto mt-6 max-w-4xl text-left leading-8 text-zinc-300"
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
