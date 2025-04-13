import { createPool } from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

// Configuration du pool de connexions MariaDB
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestepi',
  connectionLimit: 10,
});

// Fonction pour obtenir une connexion à la base de données
export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    throw error;
  }
}

export default pool;