"use client";

import { useTheme } from "next-themes";
import ScrollToTopButton from "@/app/components/ScrollToTopButton";
import { useNavbarVisibility } from "@/app/components/NavbarVisibilityContext";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ICON IMPORTS
import { FaChevronDown } from "react-icons/fa6";

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
type ArabicFontOption = "amiri" | "noto-naskh-arabic" | "rubik" | "kfgq";

const FontClasses = {
  amiri: "font-amiri",
  "noto-naskh-arabic": "font-noto-naskh-arabic",
  rubik: "font-rubik",
  kfgq: "font-kfgq",
};

type ReaderSettings = {
  arabicFont: ArabicFontOption;
  arabicFontSize: number;
  translationFontSize: number;
};

type AyahAudio = {
  reciter: string;
  url: string;
  originalUrl: string;
};

type SurahAudioMap = Record<string, Record<string, AyahAudio>>;

type AyahItem = {
  ayah: string;
  index: number;
  translation: string;
  audio?: Record<string, AyahAudio>;
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
    raw.arabicFont === "noto-naskh-arabic" ||
    raw.arabicFont === "rubik" ||
    raw.arabicFont === "kfgq"
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

const getFirstAudioUrl = (audio?: Record<string, AyahAudio>) => {
  if (!audio) return null;
  const firstEntry = Object.values(audio)[0];
  return firstEntry?.url || firstEntry?.originalUrl || null;
};

const SurahPageClient = ({
  surahData,
  surahList = [],
  audioMap,
}: {
  surahData: SurahData;
  surahList?: SurahSummary[];
  audioMap?: SurahAudioMap;
}) => {
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<Record<number, HTMLElement | null>>({});
  const [activeAyahIndex, setActiveAyahIndex] = useState<number | null>(null);
  const [moreOptionsMobile, setMoreOptionsMobile] = useState<number | null>(
    null,
  );
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState<TranslationLanguage>("english");
  const [filterSurahList, setFilterSurahList] = useState<
    "surah" | "juz" | "page"
  >("surah");
  const [rightSiderbarOptions, setRightSidebarOptions] = useState<
    "translation" | "reading"
  >("translation");
  const [searchQuery] = useState("");
  const [surahSearchQuery, setSurahSearchQuery] = useState("");
  const [isSurahListOpen, setIsSurahListOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openSettingsPanel, setOpenSettingsPanel] = useState<
    "reading" | "font" | ""
  >("font");
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
    audio: audioMap?.[String(index + 1)],
  }));

  const filteredAyahs =
    normalizedQuery.length === 0
      ? ayahs
      : ayahs.filter((item) =>
          item.translation.toLowerCase().includes(normalizedQuery),
        );

  const filteredAyahsRef = useRef<AyahItem[]>([]);
  const activeAyahIndexRef = useRef<number | null>(null);

  useEffect(() => {
    filteredAyahsRef.current = filteredAyahs;
  }, [filteredAyahs]);

  useEffect(() => {
    activeAyahIndexRef.current = activeAyahIndex;
  }, [activeAyahIndex]);

  useEffect(() => {
    if (activeAyahIndex === null) return;
    const activeNode = ayahRefs.current[activeAyahIndex];
    if (!activeNode) return;
    activeNode.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeAyahIndex]);

  const filteredSurahList =
    normalizedSurahQuery.length === 0
      ? surahList
      : surahList.filter((surah) => {
          const searchable =
            `${surah.surahName} ${surah.surahNameTranslation} ${surah.surahNameArabic}`.toLowerCase();
          return searchable.includes(normalizedSurahQuery);
        });

  const getAudioByAyahIndex = (ayahIndex: number) =>
    ayahs.find((item) => item.index === ayahIndex)?.audio;

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

  const playNextAyah = (currentIndex: number) => {
    const list = filteredAyahsRef.current;
    const currentPosition = list.findIndex(
      (item) => item.index === currentIndex,
    );

    for (let i = currentPosition + 1; i < list.length; i += 1) {
      const nextItem = list[i];
      if (getFirstAudioUrl(nextItem.audio)) {
        handlePlayAyah(nextItem.index, nextItem.audio);
        return;
      }
    }

    setIsPlaying(false);
    setActiveAyahIndex(null);
  };

  const handlePlayAyah = (
    ayahIndex: number,
    audio?: Record<string, AyahAudio>,
  ) => {
    const url = getFirstAudioUrl(audio);
    if (!url) {
      console.warn("No audio available for ayah", ayahIndex + 1);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", () => {
        const currentIndex = activeAyahIndexRef.current;
        if (currentIndex === null) {
          setIsPlaying(false);
          return;
        }
        playNextAyah(currentIndex);
      });
      audioRef.current.addEventListener("pause", () => {
        setIsPlaying(false);
      });
    }

    const audioElement = audioRef.current;

    if (activeAyahIndex === ayahIndex && isPlaying) {
      audioElement.pause();
      return;
    }

    if (audioElement.src !== url) {
      audioElement.src = url;
    }

    audioElement
      .play()
      .then(() => {
        setActiveAyahIndex(ayahIndex);
        setIsPlaying(true);
        setHasPlayedAudio(true);
      })
      .catch((error) => {
        console.error("Failed to play audio:", error);
      });
  };

  return (
    <div className="min-h-screen pl-2 md:pl-15 pr-2 sm:pl-0 text-primary lg:pl-87 lg:pr-80">
      {/* <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(70%_45%_at_50%_0%,rgba(251,191,36,0.08)_0%,rgba(9,9,11,0)_70%)]" /> */}

      <aside className="fixed bg-secondary-foreground left-0 bottom-0 md:top-0 z-50 flex flex-row md:flex-col md:h-screen w-full md:w-15 border-r border-border-color py-1">
        <Link
          href="/"
          className="hidden md:flex group relative rounded-xl p-2 text-primary transition hover:border-border-color hover:text-primary"
          aria-label="Home"
        >
          <Image src="/assets/icon.svg" alt="Home" width={36} height={36} />
        </Link>

        <div className="flex md:flex-col justify-center items-center gap-6 md:gap-8 w-full h-full">
          <Link
            href="/"
            className="hidden md:flex group relative rounded-xl p-2 text-primary transition hover:border-border-color hover:text-primary"
            aria-label="Home"
          >
            <span className="pointer-events-none absolute left-1/2 -translate-y-1/2 top-1/2 translate-x-2 whitespace-nowrap rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background opacity-0 transition duration-200 group-hover:translate-x-4 group-hover:opacity-100">
              Home
            </span>
            <Image src="/assets/home.svg" alt="Home" width={20} height={20} />
          </Link>
          <button
            type="button"
            className="group relative rounded-xl p-2 text-primary transition hover:border-border-color hover:text-primary"
            aria-label="Read Quran"
          >
            <span className="pointer-events-none absolute left-1/2 -translate-y-1/2 top-1/2 translate-x-2 whitespace-nowrap rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background opacity-0 transition duration-200 group-hover:translate-x-4 group-hover:opacity-100">
              Read Quran
            </span>
            <Image
              src="/assets/readQuran.svg"
              alt="Read Quran"
              width={20}
              height={20}
            />
          </button>
          <button
            type="button"
            className="group relative rounded-xl p-2 text-primary transition hover:border-border-color hover:text-primary"
            aria-label="Go to ayah"
          >
            <span className="pointer-events-none absolute left-1/2 -translate-y-1/2 top-1/2 translate-x-2 whitespace-nowrap rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background opacity-0 transition duration-200 group-hover:translate-x-4 group-hover:opacity-100">
              Go to Ayah
            </span>
            <Image
              src="/assets/goToAyah.svg"
              alt="Go to ayah"
              width={20}
              height={20}
            />
          </button>
          <button
            type="button"
            className="group relative rounded-xl p-3 text-primary transition hover:border-amber-200/30 hover:text-primary"
            aria-label="Bookmark"
          >
            <span className="pointer-events-none absolute left-1/2 -translate-y-1/2 top-1/2 translate-x-2 whitespace-nowrap rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background opacity-0 transition duration-200 group-hover:translate-x-4 group-hover:opacity-100">
              Bookmark
            </span>
            <Image
              src="/assets/bookmark.svg"
              alt="Bookmarks"
              width={20}
              height={20}
            />
          </button>
          <button
            type="button"
            className="group relative rounded-xl p-3 text-primary transition hover:border-amber-200/30 hover:text-primary"
            aria-label="Others"
          >
            <span className="pointer-events-none absolute left-1/2 -translate-y-1/2 top-1/2 translate-x-2 whitespace-nowrap rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background opacity-0 transition duration-200 group-hover:translate-x-4 group-hover:opacity-100">
              Others
            </span>
            <Image
              src="/assets/others.svg"
              alt="Others"
              width={20}
              height={20}
            />
          </button>
        </div>
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
        className={`fixed left-0 md:left-15 top-0 z-40 bg-background flex h-screen w-full md:w-72 flex-col border-r border-border-color transition-transform duration-300 lg:translate-x-0 ${isNavbarVisible ? "translate-y-15" : "translate-y-0"} ${
          isSurahListOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 py-5">
          <div className="w-full ">
            <div className="relative py-2 w-full inline-flex justify-around items-center rounded-full bg-secondary-foreground">
              <span
                className={`absolute  top-1/2 -translate-y-1/2 left-0 translate-x-0 z-1 w-1/3 h-7 rounded-full bg-background transition-all duration-300 ${filterSurahList === "surah" ? "ml-1 translate-x-0" : filterSurahList === "juz" ? "translate-x-full" : "-ml-1 translate-x-[200%]"} `}
              ></span>
              <button
                type="button"
                onClick={() => setFilterSurahList("surah")}
                className={`cursor-pointer rounded-full  text-sm font-medium transition z-5 ${
                  filterSurahList === "surah"
                    ? "text-primary"
                    : "text-secondary-text"
                }`}
              >
                Surah
              </button>
              <button
                type="button"
                onClick={() => setFilterSurahList("juz")}
                className={`cursor-pointer rounded-full text-sm font-medium transition z-5 ${
                  filterSurahList === "juz"
                    ? "text-primary"
                    : "text-secondary-text"
                }`}
              >
                Juz
              </button>
              <button
                type="button"
                onClick={() => setFilterSurahList("page")}
                className={`cursor-pointer rounded-full text-sm font-medium transition z-5 ${
                  filterSurahList === "page"
                    ? "text-primary"
                    : "text-secondary-text"
                }`}
              >
                Page
              </button>
            </div>
          </div>
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
                  : "border-transparent text-primary hover:bg-accent-green/10"
              }`}
            >
              <div
                className={`ml-4 relative flex justify-center items-center text-sm font-medium group-hover:text-background ${surah.surahNo === surahData?.surahNo ? "text-primary" : "text-[#787d7a]"}  `}
              >
                <span
                  className={`z-5 ${surah.surahNo === surahData?.surahNo ? "text-background" : "text-primary"}`}
                >
                  {surah.surahNo}
                </span>
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
        className={`fixed right-0 top-0 z-40 flex h-screen bg-background w-full md:w-80 flex-col gap-4 p-2 border-l border-border-color transition-transform duration-300 lg:translate-x-0 ${isNavbarVisible ? "translate-y-15" : "translate-y-0"} ${
          isSettingsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-4 py-5">
          <div className="w-full ">
            <div className="relative py-1 border-4 border-secondary-foreground w-full inline-flex justify-around items-center rounded-full bg-secondary-foreground">
              <span
                className={`absolute top-1/2 -translate-y-1/2 left-0 translate-x-0 z-1 w-1/2 h-7 rounded-full bg-background transition-all duration-300 ${rightSiderbarOptions === "translation" ? "translate-x-0" : "translate-x-full"} `}
              ></span>
              <button
                type="button"
                onClick={() => setRightSidebarOptions("translation")}
                className={`cursor-pointer rounded-full  text-sm font-medium transition z-5 ${
                  rightSiderbarOptions === "translation"
                    ? "text-primary"
                    : "text-subtitle-secondary-text"
                }`}
              >
                Translation
              </button>
              <button
                type="button"
                onClick={() => setRightSidebarOptions("reading")}
                className={`cursor-pointer rounded-full text-sm font-medium transition z-5 ${
                  rightSiderbarOptions === "reading"
                    ? "text-primary"
                    : "text-subtitle-secondary-text"
                }`}
              >
                Reading
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() =>
              setOpenSettingsPanel((prev) =>
                prev === "reading" ? "" : "reading",
              )
            }
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-primary cursor-pointer"
            aria-expanded={openSettingsPanel === "reading"}
          >
            <span className="inline-flex items-center gap-2">
              {openSettingsPanel === "reading" ? (
                <Image
                  src="/assets/readingSettingsActive.svg"
                  alt="Reading Settings"
                  width={20}
                  height={20}
                />
              ) : (
                <Image
                  src="/assets/readingSettings.svg"
                  alt="Reading Settings"
                  width={20}
                  height={20}
                />
              )}
              <span>Reading Settings</span>
            </span>
            <span
              className={`text-xs text-primary/70 ${openSettingsPanel === "reading" ? "rotate-180" : ""} transition-transform`}
            >
              <FaChevronDown />
            </span>
          </button>

          {/* {openSettingsPanel === "reading" && ( */}
          <div
            className={`space-y-4 px-4 transition-all duration-300 overflow-hidden ${openSettingsPanel === "reading" ? "h-[86%] opacity-100 translate-y-2" : " opacity-0 h-0 translate-y-0"}`}
          >
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-secondary-text">
                Translations
              </h3>
              <select
                className="w-full rounded-lg bg-secondary-foreground px-3 py-2 text-sm text-secondary-text outline-none focus:border-amber-200/40 cursor-pointer"
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as TranslationLanguage)
                }
              >
                <option value="Saheeh International">
                  Saheeh International
                </option>
                <option value="Sherif Ahmeti">Sherif Ahmeti</option>
              </select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-secondary-text">
                Word-by-word translation
              </h3>
              <select
                className="w-full rounded-lg bg-secondary-foreground px-3 py-2 text-sm text-secondary-text outline-none focus:border-amber-200/40 cursor-pointer"
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as TranslationLanguage)
                }
              >
                <option value="Bengali">Bengali</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="showbyword"
                className="relative flex justify-between items-center text-sm font-semibold text-secondary-text"
              >
                Show by words
                <input
                  type="checkbox"
                  id="showbyword"
                  className="inline-block appearance-none bg-secondary-foreground h-7 w-14 rounded-full relative cursor-pointer transition-all after:content-[''] after:translate-x-0 after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-foreground/10 checked:after:bg-accent-green checked:after:translate-x-6 after:transition-all duration-300 outline-none"
                />
              </label>
            </div>

            <div>
              <label
                htmlFor="tajweed"
                className="relative flex justify-between items-center text-sm font-semibold text-secondary-text"
              >
                Tajweed
                <input
                  type="checkbox"
                  id="tajweed"
                  className="inline-block appearance-none bg-secondary-foreground h-7 w-14 rounded-full relative cursor-pointer transition-all after:content-[''] after:translate-x-0 after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-foreground/10 checked:after:bg-accent-green checked:after:translate-x-6 after:transition-all duration-300 outline-none"
                />
              </label>
            </div>
            {/* <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Translation
              </p>
              <div className="mt-3 inline-flex items-center rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setLanguage("english")}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition ${
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
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    language === "bengali"
                      ? "bg-amber-100/10 text-primary"
                      : "text-primary hover:text-primary"
                  }`}
                >
                  Bangla
                </button>
              </div>
            </div> */}

            {/* <div>
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
            </div> */}
          </div>
          {/* )} */}
        </div>

        <div>
          <button
            type="button"
            onClick={() =>
              setOpenSettingsPanel((prev) => (prev === "font" ? "" : "font"))
            }
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-primary cursor-pointer"
            aria-expanded={openSettingsPanel === "font"}
          >
            <span className="inline-flex items-center gap-2">
              {openSettingsPanel === "font" ? (
                <Image
                  src="/assets/fontSettingsActive.svg"
                  alt="Font Settings"
                  width={20}
                  height={20}
                />
              ) : (
                <Image
                  src="/assets/fontSettings.svg"
                  alt="Font Settings"
                  width={20}
                  height={20}
                />
              )}
              <span
                className={` text-primar ${openSettingsPanel === "font" ? "text-accent-green" : ""}`}
              >
                Font Settings
              </span>
            </span>
            <span
              className={`text-xs text-primary/70 ${openSettingsPanel === "font" ? "rotate-180" : ""} transition-transform`}
            >
              <FaChevronDown />
            </span>
          </button>

          {/* {openSettingsPanel === "font" && ( */}
          <div
            className={`space-y-4 px-4 py-4 transition-all duration-300 overflow-hidden ${openSettingsPanel === "font" ? "h-full opacity-100" : "opacity-0 h-0"}`}
          >
            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-primary">
                <label className="text-sm font-semibold text-primary">
                  Arabic Font Size
                </label>
                <label className="text-sm font-semibold text-primary">
                  {settings.arabicFontSize}
                </label>
              </div>
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
                className="w-full h-1 accent-accent-green rounded-full cursor-pointer"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-primary">
                <label>Translation Font Size</label>

                <label>{settings.translationFontSize}</label>
              </div>
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
                className="w-full h-1 accent-accent-green rounded-full cursor-pointer"
              />
            </div>
            <div>
              <label
                htmlFor="arabic-font"
                className="mb-2 block text-sm font-semibold text-primary"
              >
                Arabic Font Face
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
                className="w-full rounded-lg bg-secondary-foreground px-3 py-2 text-sm text-primary outline-none focus:border-amber-200/40 cursor-pointer"
              >
                <option value="kfgq">KFGQ</option>
                <option value="amiri">Amiri</option>
                <option value="noto-naskh-arabic">Naskh</option>
                <option value="rubik">Rubik</option>
              </select>
            </div>

            <div className="w-full p-3.5 rounded-lg bg-accent-green/10 border border-accent-green/7">
              <p className="text-base text-primary-text font-bold mb-2">
                Help spread the knowledge of Islam
              </p>
              <p className="text-xs text-subtitle-secondary-text leading-relaxed mb-4">
                Your regular support helps us reach our religious brothers and
                sisters with the message of Islam. Join our mission and be part
                of the big change.
              </p>
              <Link
                href="#"
                className="w-full mt-3 block text-sm text-background font-semibold bg-accent-green text-center py-2.5 rounded-md"
              >
                Support Us
              </Link>
            </div>
          </div>
          {/* )} */}
        </div>
      </aside>

      <section className="relative mx-auto max-w-6xl px-0 pb-16 pt-8 lg:pb-24 lg:pt-12">
        {/* <div className="mb-6 flex items-center gap-2">
          <Link
            href="/"
            className="cursor-pointer rounded-full border border-border-color px-4 py-2 text-sm font-semibold text-primary transition hover:border-amber-200/30 hover:text-primary"
          >
            Back
          </Link>
        </div> */}

        {surahData && (
          <>
            <header className="grid grid-rows-2 md:grid-cols-3 items-center gap-4 px-4 md:mb-10 pb-8 lg:mb-12 lg:pb-10">
              {surahData.revelationPlace === "Mecca" ? (
                <Image
                  src="/assets/makkah.webp"
                  alt="Surah Header"
                  width={140}
                  height={48}
                  className={`hidden lg:block col-span-1 ${theme === "dark" ? "invert" : theme === "sepia" ? "mix-blend-multiply" : ""}`}
                />
              ) : (
                <Image
                  src="/assets/madinah.avif"
                  alt="Surah Header"
                  width={140}
                  height={94}
                  className={`hidden lg:block col-span-1 ${theme === "dark" ? "invert" : theme === "sepia" ? "mix-blend-multiply" : ""}`}
                />
              )}

              <div className="flex flex-col items-center text-center col-span-1 text-secondary-text">
                <h1 className="text-primary-text text-lg md:text-xl font-semibold">
                  Surah {surahData.surahName}
                </h1>
                <p className="text-xs md:text-sm text-secondary-text">
                  Ayah-{surahData.totalAyah}, {surahData.revelationPlace}
                </p>
              </div>

              <Image
                src="/assets/bismillah.svg"
                alt="Surah Header"
                width={220}
                height={45}
                className={`flex w-43 opacity-40 justify-self-center lg:justify-self-end row-span-1 md:col-span-1 ${theme === "dark" ? "invert" : ""}`}
              />

              {/* <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
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
                <span className="rounded-full border border-border-color px-3 py-1.5 text-primary">
                  {surahData.revelationPlace}
                </span>
              </div> */}
            </header>

            <div className="">
              {filteredAyahs.length === 0 && (
                <p className="rounded-xl border border-border-color bg-accent-green/10 px-4 py-6 text-center text-sm text-primary">
                  No ayah found for this search query.
                </p>
              )}

              {filteredAyahs.map(({ ayah, index, translation, audio }) => (
                <article
                  key={index}
                  ref={(node) => {
                    ayahRefs.current[index] = node;
                  }}
                  className={`border-b border-border-color p-6 ${activeAyahIndex === index ? "bg-accent-green/10" : ""} transition-colors`}
                >
                  <div className="mb-5 flex items-center justify-between px-2 md:px-0 gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center font-bold text-accent-green">
                      {surahData.surahNo}:{index + 1}
                    </span>
                    <span>
                      <button
                        onClick={() => setMoreOptionsMobile(index)}
                        className="md:hidden rounded-full hover:bg-accent-green/7"
                      >
                        <Image
                          src="/assets/moreIcon.svg"
                          alt="More Options"
                          width={18}
                          height={18}
                          className="inline-block md:hidden"
                        />
                      </button>
                    </span>
                  </div>

                  <div className="flex items-start gap-7">
                    <div className="hidden md:flex flex-col items-center justify-center gap-2">
                      <button
                        type="button"
                        className="group relative flex items-center justify-center size-8 text-sm text-primary transition rounded-full hover:bg-accent-green/7"
                        onClick={() => handlePlayAyah(index, audio)}
                        aria-pressed={activeAyahIndex === index && isPlaying}
                      >
                        <span className="ml-2 pointer-events-none absolute left-1/2 -translate-y-1/2 top-1/2 translate-x-3 whitespace-nowrap rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background opacity-0 transition duration-200 group-hover:translate-x-4 group-hover:opacity-100">
                          Play
                        </span>
                        {isPlaying && activeAyahIndex === index ? (
                          <Image
                            src="/assets/pauseIcon.svg"
                            alt="Pause Audio"
                            width={16}
                            height={16}
                          />
                        ) : (
                          <Image
                            src="/assets/playIcon.svg"
                            alt="Play Audio"
                            width={18}
                            height={18}
                          />
                        )}
                      </button>

                      <button
                        type="button"
                        className="group relative flex items-center justify-center size-8 text-sm text-primary transition rounded-full hover:bg-accent-green/7"
                        onClick={() => handlePlayAyah(index, audio)}
                        aria-pressed={activeAyahIndex === index && isPlaying}
                      >
                        <span className="ml-2 pointer-events-none absolute left-1/2 -translate-y-1/2 top-1/2 translate-x-3 whitespace-nowrap rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background opacity-0 transition duration-200 group-hover:translate-x-4 group-hover:opacity-100">
                          Tafsir
                        </span>
                        <Image
                          src="/assets/readingSettings.svg"
                          alt="Tafsir"
                          width={16}
                          height={16}
                        />
                      </button>

                      <button
                        type="button"
                        className="group relative flex items-center justify-center size-8 text-sm text-primary transition rounded-full hover:bg-accent-green/7"
                        onClick={() => handlePlayAyah(index, audio)}
                        aria-pressed={activeAyahIndex === index && isPlaying}
                      >
                        <span className="ml-2 pointer-events-none absolute left-1/2 -translate-y-1/2 top-1/2 translate-x-3 whitespace-nowrap rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background opacity-0 transition duration-200 group-hover:translate-x-4 group-hover:opacity-100">
                          Bookmark
                        </span>
                        <Image
                          src="/assets/bookmark.svg"
                          alt="Bookmark"
                          width={16}
                          height={16}
                        />
                      </button>

                      <button
                        type="button"
                        className="group relative flex items-center justify-center size-8 text-sm text-primary transition rounded-full hover:bg-accent-green/7"
                        onClick={() => handlePlayAyah(index, audio)}
                        aria-pressed={activeAyahIndex === index && isPlaying}
                      >
                        <span className="ml-2 pointer-events-none absolute left-1/2 -translate-y-1/2 top-1/2 translate-x-3 whitespace-nowrap rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background opacity-0 transition duration-200 group-hover:translate-x-4 group-hover:opacity-100">
                          More
                        </span>
                        <Image
                          src="/assets/moreIcon.svg"
                          alt="More"
                          width={16}
                          height={16}
                        />
                      </button>
                    </div>

                    <div className="flex-1">
                      <p
                        className={`text-right leading-[2.25] text-primary-text ${FontClasses[settings.arabicFont]} `}
                        dir="rtl"
                        lang="ar"
                        style={{
                          fontSize: `${settings.arabicFontSize}px`,
                        }}
                      >
                        {ayah}
                      </p>

                      <p
                        className="mx-auto mt-6 max-w-4xl text-left leading-8 text-primary-text"
                        style={{
                          fontSize: `${settings.translationFontSize}px`,
                        }}
                      >
                        {highlightSearchTerm(translation)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {moreOptionsMobile !== null && (
        <>
          <div
            onClick={() => setMoreOptionsMobile(null)}
            className="absolute inset-0 z-50 w-full bg-black/50 h-screen"
          />
          <div
            className="h-90 bottom-0 fixed bg-background inset-x-0 rounded-t-2xl z-50 flex items-start justify-start lg:hidden"
            onClick={() => setMoreOptionsMobile(null)}
          >
            <div className="flex flex-col space-y-2 px-3 py-6">
              <button
                onClick={() =>
                  handlePlayAyah(
                    moreOptionsMobile,
                    getAudioByAyahIndex(moreOptionsMobile),
                  )
                }
                className="flex py-2 gap-4 items-center text-primary"
              >
                <Image
                  src="/assets/playIcon.svg"
                  alt="Play"
                  width={20}
                  height={20}
                />
                <span className="text-base text-subtitle-secondary-text">
                  Play
                </span>
              </button>
              <button className="flex py-2 gap-4 items-center text-primary">
                <Image
                  src="/assets/readingSettings.svg"
                  alt="Tafsir"
                  width={20}
                  height={20}
                  className="brightness-60"
                />
                <span className="text-base text-subtitle-secondary-text">
                  Tafsir
                </span>
              </button>
              <button className="flex py-2 gap-4 items-center text-primary">
                <Image
                  src="/assets/bookmark.svg"
                  alt="Bookmark"
                  width={20}
                  height={20}
                  className="brightness-80"
                />
                <span className="text-base text-subtitle-secondary-text">
                  Bookmark
                </span>
              </button>
              <button className="flex py-2 gap-4 items-center text-primary">
                <Image
                  src="/assets/ayahCopy.svg"
                  alt="Copy"
                  width={20}
                  height={20}
                />
                <span className="text-base text-subtitle-secondary-text">
                  Copy Ayah
                </span>
              </button>
              <button className="flex py-2 gap-4 items-center text-primary">
                <Image
                  src="/assets/copyLink.svg"
                  alt="Copy Link"
                  width={20}
                  height={20}
                />
                <span className="text-base text-subtitle-secondary-text">
                  Copy Link
                </span>
              </button>
              <button className="flex py-2 gap-4 items-center text-primary">
                <Image
                  src="/assets/ayahShare.svg"
                  alt="Share"
                  width={20}
                  height={20}
                />
                <span className="text-base text-subtitle-secondary-text">
                  Share
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {hasPlayedAudio && (
        <div className="fixed bottom-0 left-0 z-50 w-full bg-secondary-foreground px-20 py-3.5 flex items-center justify-center md:justify-between">
          <p className="hidden md:flex min-w-0 text-sm text-primary-text">
            {surahData?.surahName}
            {activeAyahIndex !== null ? ` : ${activeAyahIndex + 1}` : ""}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="hover:bg-accent-green/7 rounded-full p-2">
              <Image
                src="/assets/moreIcon.svg"
                alt="More Options"
                width={18}
                height={18}
              />
            </button>

            <button
              onClick={() => {
                if (activeAyahIndex === null) return;
                const prevIndex = activeAyahIndex - 1;
                if (prevIndex >= 0) {
                  handlePlayAyah(prevIndex, getAudioByAyahIndex(prevIndex));
                  const prevAyahElement = ayahRefs.current[prevIndex];
                  if (prevAyahElement) {
                    prevAyahElement.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                }
              }}
              className="flex items-center justify-centerhover:bg-accent-green/7 rounded-full p-2"
            >
              <Image
                src="/assets/audioPlayerNextPrevAyah.svg"
                alt="Previous"
                width={18}
                height={18}
                className="rotate-180"
              />
            </button>

            {isPlaying ? (
              <button
                className="flex items-center gap-2 justify-center rounded-full bg-accent-green p-2 text-sm font-medium text-primary transition-transform duration-300 active:scale-90 outline-none"
                onClick={() => {
                  audioRef.current?.pause();
                  setIsPlaying(false);
                }}
              >
                <Image
                  src="/assets/audioPlayerPause.svg"
                  alt="Pause"
                  width={16}
                  height={16}
                />
              </button>
            ) : (
              <button
                className="flex items-center gap-2 justify-center rounded-full bg-accent-green p-2 text-sm font-medium text-primary transition-transform duration-300 active:scale-90 outline-none"
                onClick={() => {
                  audioRef.current?.play();
                  setIsPlaying(true);
                }}
              >
                <Image
                  src="/assets/audioPlayerPlay.svg"
                  alt="Play"
                  width={18}
                  height={18}
                />
              </button>
            )}

            <button
              onClick={() => {
                if (activeAyahIndex === null) return;
                const nextIndex = activeAyahIndex + 1;
                if (nextIndex < ayahs.length) {
                  handlePlayAyah(nextIndex, getAudioByAyahIndex(nextIndex));
                  const nextAyahElement = ayahRefs.current[nextIndex];
                  if (nextAyahElement) {
                    nextAyahElement.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                }
              }}
              className="hover:bg-accent-green/7 rounded-full p-2"
            >
              <Image
                src="/assets/audioPlayerNextPrevAyah.svg"
                alt="Next"
                width={18}
                height={18}
              />
            </button>

            <button
              onClick={() => setHasPlayedAudio(false)}
              className="flex items-center justify-center hover:bg-accent-green/7 rounded-full p-2"
            >
              <Image
                src="/assets/close.svg"
                alt="Close Player"
                width={18}
                height={18}
              />
            </button>
          </div>
          <span aria-hidden className="hidden md:inline-block w-[72px]" />
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
};

export default SurahPageClient;
