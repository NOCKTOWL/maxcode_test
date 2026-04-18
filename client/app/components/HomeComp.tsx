"use client";

import { useState, useEffect } from "react";
import { getAllSurahs } from "../lib/api";

type Surah = {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
};

const HomeComp = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAllSurahs();
        setSurahs(response.chapters ?? []);
        console.log("Surahs fetched successfully:", response);
      } catch (error) {
        console.error("Error fetching surahs:", error);
        setError(
          "Could not load surah list. Please check if the backend is running.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurahs();
  }, []);

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-amber-100/70 bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 p-4 shadow-xl shadow-amber-100/60 sm:p-6 lg:p-10">
      <div className="pointer-events-none absolute -top-16 -right-12 h-48 w-48 rounded-full bg-orange-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-rose-300/25 blur-3xl" />

      <div className="relative mb-8 flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700/80">
          Quran Chapters Directory
        </p>
        <h1 className="text-3xl font-black leading-tight text-zinc-900 sm:text-4xl lg:text-5xl">
          All 114 Surahs
        </h1>
        <p className="max-w-2xl text-sm text-zinc-700 sm:text-base">
          Browse each chapter name in Arabic and English with quick chapter
          details.
        </p>
      </div>

      {isLoading && (
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-orange-200/60 bg-white/70"
            />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="relative rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <ul className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {surahs.map((surah) => (
            <li
              key={surah.id}
              className="group rounded-2xl border border-amber-200/70 bg-white/80 p-4 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white hover:shadow-lg"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                  #{surah.id}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {surah.verses_count} verses
                </span>
              </div>

              <p
                className="mb-2 text-right text-2xl leading-tight text-zinc-900 sm:text-3xl"
                dir="rtl"
                lang="ar"
              >
                {surah.name_arabic}
              </p>

              <h2 className="text-lg font-bold text-zinc-900">
                {surah.name_simple}
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                {surah.translated_name.name}
              </p>

              <div className="mt-3 inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize text-zinc-700">
                {surah.revelation_place}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default HomeComp;
