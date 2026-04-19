import SurahPageClient from "./SurahPageClient";
import { getSurahById } from "@/app/lib/api";

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
    const surahData: SurahData | null = await getSurahById(
      parseInt(resolvedParams.id),
    );
    if (!surahData) {
      console.error(`No data found for surah with ID ${resolvedParams.id}`);
      return;
    }
    return <SurahPageClient surahData={surahData} />;
  } catch (error) {
    console.error(`Error fetching surah with ID ${resolvedParams.id}:`, error);
    return;
  }
}
