import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// IMPORT ROUTES
import { SurahRoutes } from './routes/surah.routes';
import { VersesRoutes } from './routes/verses.route';

// EXPRESS APP
const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api', SurahRoutes);
app.use('/api', VersesRoutes);

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});