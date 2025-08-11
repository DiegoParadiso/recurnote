import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, sequelize } from './config/db.js';
import { User } from './models/user.model.js';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // Sincronizar modelos con la DB (solo en desarrollo)
  sequelize.sync().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
    });
  });
});
