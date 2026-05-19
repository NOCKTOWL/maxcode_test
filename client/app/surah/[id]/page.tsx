import SurahPageClient from "./SurahPageClient";
import { getAllSurahs, getSurahAudioById, getSurahById } from "@/app/lib/api";

type SurahSummary = {
  surahName: string;
  surahNameArabic: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  surahNo: number;
};

type AyahAudio = {
  reciter: string;
  url: string;
  originalUrl: string;
};

type SurahAudioMap = Record<string, Record<string, AyahAudio>>;

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
    const surahData = await getSurahById(surahId);
    if (!surahData) {
      console.error(`No data found for surah with ID ${resolvedParams.id}`);
      return;
    }
    const [surahList, surahAudio] = await Promise.all([
      getAllSurahs(),
      getSurahAudioById(surahId, Number(surahData.totalAyah) || 0),
    ]);
    const normalizedSurahList: SurahSummary[] = Array.isArray(surahList)
      ? surahList.map((surah, index) => ({
          ...surah,
          surahNo: index + 1,
        }))
      : [];
    return (
      <SurahPageClient
        surahData={surahData}
        surahList={normalizedSurahList}
        audioMap={surahAudio as SurahAudioMap}
      />
    );
  } catch (error) {
    console.error(`Error fetching surah with ID ${resolvedParams.id}:`, error);
    return;
  }
}
