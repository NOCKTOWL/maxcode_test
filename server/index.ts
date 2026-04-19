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

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// MIDDLEWARE
app.use(cors(corsOptions));
app.use(express.json());

// ROUTES
app.use('/api', SurahRoutes);
app.use('/api', VersesRoutes);

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});