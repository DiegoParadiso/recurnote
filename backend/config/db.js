// backend/config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

// Forzar SSL para Neon
const useSSL = true;

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: useSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
  benchmark: true,
  logging: (msg, timing) => {
    if (timing > 500) {
      logger.warn(`Slow query detected (${timing}ms): ${msg}`);
    }
  },
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL exitosa');
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error);
    process.exit(1);
  }
}

export default sequelize;
