import { User } from '../models/user.model';
import { getConnection } from '../config/db.config';
import bcrypt from 'bcrypt';

export class UserService {
  // Créer un nouvel utilisateur
  async createUser(user: User): Promise<User> {
    const conn = await getConnection();
    try {
      // Hachage du mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);

      const result = await conn.query(
        'INSERT INTO users (firstName, lastName, email, password, phone, type) VALUES (?, ?, ?, ?, ?, ?)',
        [user.firstName, user.lastName, user.email, hashedPassword, user.phone, user.type]
      );

      return { ...user, id: result.insertId };
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer un utilisateur par son ID
  async getUserById(id: number): Promise<User | null> {
    const conn = await getConnection();
    try {
      const rows = await conn.query('SELECT id, firstName, lastName, email, phone, type, createdAt, updatedAt FROM users WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      return rows[0];
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer un utilisateur par son email
  async getUserByEmail(email: string): Promise<User | null> {
    const conn = await getConnection();
    try {
      const rows = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) return null;
      return rows[0];
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer tous les utilisateurs
  async getAllUsers(): Promise<User[]> {
    const conn = await getConnection();
    try {
      return await conn.query('SELECT id, firstName, lastName, email, phone, type, createdAt, updatedAt FROM users');
    } finally {
      if (conn) conn.release();
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(id: number, user: Partial<User>): Promise<boolean> {
    const conn = await getConnection();
    try {
      // Si le mot de passe est présent, le hacher
      if (user.password) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }

      // Construire la requête dynamiquement en fonction des champs à mettre à jour
      const fields = Object.keys(user)
        .filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt')
        .map(key => `${key} = ?`);
      
      const values = Object.keys(user)
        .filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt')
        .map(key => user[key as keyof Partial<User>]);

      if (fields.length === 0) return false;

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      values.push(id);

      const result = await conn.query(query, values);
      return result.affectedRows > 0;
    } finally {
      if (conn) conn.release();
    }
  }

  // Supprimer un utilisateur
  async deleteUser(id: number): Promise<boolean> {
    const conn = await getConnection();
    try {
      const result = await conn.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } finally {
      if (conn) conn.release();
    }
  }

  // Vérifier les identifiants de connexion
  async validateCredentials(email: string, password: string): Promise<User | null> {
    const conn = await getConnection();
    try {
      const rows = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) return null;
      
      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) return null;
      
      // Ne pas renvoyer le mot de passe
      delete user.password;
      return user;
    } finally {
      if (conn) conn.release();
    }
  }
}