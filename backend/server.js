import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, sequelize } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  const alter = process.env.NODE_ENV !== 'production';
  sequelize.sync(alter ? { alter: true } : undefined).then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
    });
  });
});
