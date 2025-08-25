import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();


app.use(express.json());
app.use(cors());


connectDB();


app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('API is running...');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
