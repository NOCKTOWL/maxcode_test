import SurahPageClient from "./SurahPageClient";
import { getAllSurahs, getSurahById } from "@/app/lib/api";

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

type SurahSummary = {
  surahName: string;
  surahNameArabic: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  surahNo: number;
};

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  try {
    const surahId = parseInt(resolvedParams.id);
    const [surahData, surahList] = await Promise.all([
      getSurahById(surahId),
      getAllSurahs(),
    ]);
    const normalizedSurahList: SurahSummary[] = Array.isArray(surahList)
      ? surahList.map((surah, index) => ({
          ...surah,
          surahNo: index + 1,
        }))
      : [];
    if (!surahData) {
      console.error(`No data found for surah with ID ${resolvedParams.id}`);
      return;
    }
    return (
      <SurahPageClient surahData={surahData} surahList={normalizedSurahList} />
    );
  } catch (error) {
    console.error(`Error fetching surah with ID ${resolvedParams.id}:`, error);
    return;
  }
}
