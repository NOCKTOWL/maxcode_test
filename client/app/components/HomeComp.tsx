import Link from "next/link";

type Surah = {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyahs: number;
};

const HomeComp = ({ surahs }: { surahs: Surah[] }) => {
  return (
    <section className="relative mx-auto w-full max-w-6xl">
      <h1 className="text-center text-2xl md:text-5xl font-semibold uppercase tracking-[0.26em] text-secondary-text">
        The Holy Quran
      </h1>
      <h2
        className="mt-2 text-center text-2xl md:text-3xl text-primary-text"
        dir="rtl"
        lang="ar"
      >
        القرآن الكريم
      </h2>
      <header className="mb-10 border-b border-border-color pb-8 lg:mb-12 lg:pb-10">
        <h1 className="mt-4 text-4xl font-black leading-tight text-primary-text sm:text-3xl lg:text-4xl">
          All 114 Surahs
        </h1>
        <p className="mt-3 max-w-3xl text-base text-secondary-text sm:text-lg">
          Select the Surah you want to read, with translation in both English
          and Bangla.
        </p>
      </header>

      {surahs && (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {surahs.map((surah, index) => {
            const surahNumber = index + 1;
            return (
              <li
                key={surahNumber}
                className="group relative overflow-hidden rounded-2xl border border-border-color bg-secondary-foreground/80 p-5 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-accent-green/40"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border-color/80 transition-colors group-hover:bg-accent-green/40" />
                <Link
                  href={`/surah/${surahNumber}`}
                  className="block cursor-pointer"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full border border-accent-green/30 bg-accent-green/10 px-2.5 py-1 text-xs font-bold text-accent-green">
                      #{surahNumber}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-secondary-text transition-colors group-hover:text-primary-text">
                      {surah.totalAyahs} verses
                    </span>
                  </div>

                  <p
                    className="mb-4 text-right text-3xl leading-tight text-primary-text sm:text-4xl"
                    dir="rtl"
                    lang="ar"
                  >
                    {surah.surahNameArabic}
                  </p>

                  <h2 className="text-xl font-bold text-primary-text transition-colors group-hover:text-accent-green">
                    {surah.surahName}
                  </h2>
                  <p className="mt-1 text-sm text-secondary-text">
                    {surah.surahNameTranslation}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default HomeComp;
