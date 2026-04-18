import {Router, type Request, type Response} from 'express';

export const QuranRoutes = Router();

QuranRoutes.get('/surah', async (req: Request, res: Response) => {
  try {
    const response = await fetch('https://api.quran.com/api/v4/chapters');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

QuranRoutes.get('/surah/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const response = await fetch(`https://api.quran.com/api/v4/chapters/${id}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});