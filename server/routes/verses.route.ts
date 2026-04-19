import {Router, type Request, type Response} from 'express';
// import {Language, quran} from '@quranjs/api';

export const VersesRoutes = Router();

VersesRoutes.get('/verses/by_chapter/:chapter_number', async (req: Request, res: Response) => {
    const { chapter_number } = await req.params;
    try {
        const clientId = process.env.DEV_CLIENT_ID;
        const clientSecret = process.env.DEV_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

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