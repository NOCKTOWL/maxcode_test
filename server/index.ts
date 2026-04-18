import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// IMPORT ROUTES
import {QuranRoutes} from './routes/surah.routes';

// EXPRESS APP
const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api', QuranRoutes);

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});