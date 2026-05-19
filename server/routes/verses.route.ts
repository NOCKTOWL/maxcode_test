import {Router, type Request, type Response} from 'express';
// import {Language, quran} from '@quranjs/api';

export const VersesRoutes = Router();

VersesRoutes.get('/verses/by_chapter/:chapter_number', async (req: Request, res: Response) => {
    const { chapter_number } = await req.params;
    try {
        const response = await fetch(`https://quranapi.pages.dev/api/${chapter_number}.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch verses: ${response.statusText}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

VersesRoutes.get('/audio/by_chapter/:chapter_number/:total_ayah', async (req: Request, res: Response) => {
    const { chapter_number, total_ayah } = await req.params;
    console.log(`Received request for audio of chapter ${chapter_number} with total ayah ${total_ayah}`);
    try {
        const totalAyah = Number(total_ayah);

        if (!Number.isFinite(totalAyah) || totalAyah <= 0) {
            res.status(404).json({ error: 'Surah not found' });
            return;
        }

        const audioResponses = await Promise.all(
            Array.from({ length: totalAyah }, (_, index) => {
                const ayahNumber = index + 1;
                return fetch(
                    `https://quranapi.pages.dev/api/audio/${chapter_number}/${ayahNumber}.json`,
                ).then(async (response) => {
                    if (!response.ok) {
                        throw new Error(
                            `Failed to fetch audio for ayah ${ayahNumber}: ${response.statusText}`,
                        );
                    }
                    const data = await response.json();
                    return { ayahNumber, data };
                });
            }),
        );

        const audioByAyah = audioResponses.reduce<Record<string, unknown>>(
            (acc, item) => {
                acc[String(item.ayahNumber)] = item.data;
                return acc;
            },
            {},
        );

        res.json(audioByAyah);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});