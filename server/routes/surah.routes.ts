import {Router, type Request, type Response} from 'express';

export const SurahRoutes = Router();

SurahRoutes.get('/surah', async (req: Request, res: Response) => {
  try {
    const response = await fetch('https://quranapi.pages.dev/api/surah.json');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

SurahRoutes.get('/surah/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const response = await fetch(`https://quranapi.pages.dev/api/surah/${id}.json`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});