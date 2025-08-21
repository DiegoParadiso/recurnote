// backend/config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
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
  logging: false,
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
