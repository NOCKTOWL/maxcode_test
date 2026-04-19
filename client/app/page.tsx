import { getAllSurahs } from "./lib/api";
import HomeComp from "./components/HomeComp";

type Surah = {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyahs: number;
};

export default async function Home() {
  const Surah: Surah[] = await getAllSurahs();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(70%_45%_at_50%_0%,rgba(251,191,36,0.08)_0%,rgba(9,9,11,0)_70%)]" />
      <div className="relative px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <HomeComp surahs={Surah} />
      </div>
    </div>
  );
}
