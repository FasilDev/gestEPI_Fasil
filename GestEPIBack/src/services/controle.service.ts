import { Controle } from '../models/controle.model';
import { getConnection } from '../config/db.config';

// Fonction utilitaire pour convertir les BigInt en Number
const convertBigIntToNumber = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntToNumber(item));
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = convertBigIntToNumber(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
};

export class ControleService {
  // Créer un nouveau contrôle
  async createControle(controle: Controle): Promise<Controle> {
    const conn = await getConnection();
    try {
      // Assurer que epiId et userId sont des nombres
      const epiId = Number(controle.epiId);
      const userId = Number(controle.userId);
      
      // Formater la dateControle correctement
      let dateControle = new Date().toISOString().split('T')[0]; // Date par défaut
      
      if (controle.dateControle) {
        if (typeof controle.dateControle === 'object') {
          // Si c'est un objet Date
          if (controle.dateControle instanceof Date) {
            if (!isNaN(controle.dateControle.getTime())) {
              dateControle = controle.dateControle.toISOString().split('T')[0];
            }
          }
          // Si c'est un objet vide {}, nous utilisons déjà la date par défaut
        } else if (typeof controle.dateControle === 'string') {
          // Vérifier si la chaîne est une date valide
          try {
            const date = new Date(controle.dateControle);
            if (!isNaN(date.getTime())) {
              dateControle = controle.dateControle;
            }
          } catch (e) {
            console.error('Date invalide, utilisation de la date actuelle');
          }
        }
      }
      
      console.log(`Création contrôle avec date: ${dateControle}`);
      
      const result = await conn.query(
        'INSERT INTO controles (epiId, userId, dateControle, statut, commentaire) VALUES (?, ?, ?, ?, ?)',
        [
          epiId,
          userId,
          dateControle, // Utiliser la date formatée
          controle.statut,
          controle.commentaire
        ]
      );

      // Convertir insertId de BigInt à Number
      const insertId = Number(result.insertId);
      
      return convertBigIntToNumber({ 
        ...controle, 
        id: insertId,
        dateControle  // Retourner la date formatée
      });
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer un contrôle par son ID
  async getControleById(id: number): Promise<Controle | null> {
    const conn = await getConnection();
    try {
      const rows = await conn.query('SELECT * FROM controles WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      
      // Log pour déboguer
      console.log(`Contrôle récupéré par ID (${id}), date originale:`, rows[0].dateControle);
      
      // Obtenir le contrôle
      const controle = rows[0];
      
      // Si c'est une date MySQL, la convertir au format YYYY-MM-DD sans la modifier
      if (controle.dateControle instanceof Date) {
        controle.dateControle = controle.dateControle.toISOString().split('T')[0];
      }
      
      return convertBigIntToNumber(controle);
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer tous les contrôles
  async getAllControles(): Promise<Controle[]> {
    const conn = await getConnection();
    try {
      console.log('[getAllControles] Récupération de tous les contrôles...');
      
      // Utiliser une jointure pour récupérer les infos de l'EPI
      // Ajout de NOW() dans la requête pour contourner le cache potentiel
      const query = `
        SELECT c.*, 
               e.identifiant as epi_identifiant, 
               e.marque as epi_marque, 
               e.modele as epi_modele, 
               e.type as epi_type,
               NOW() as cache_buster
        FROM controles c
        LEFT JOIN epi e ON c.epiId = e.id
        ORDER BY c.dateControle DESC
      `;
      
      const rows = await conn.query(query);
      console.log(`[getAllControles] ${rows.length} contrôles récupérés`);
      
      // Log pour déboguer les dates avant traitement
      console.log('[getAllControles] Dates des contrôles reçues de la base de données:');
      rows.forEach((row: any) => {
        console.log(`Contrôle ${row.id}: ${row.dateControle} (type: ${typeof row.dateControle})`);
      });
      
      // Traitement des dates et préparation des objets
      const controles = rows.map((row: any) => {
        // Conserver la date d'origine sans modification
        let dateControle = row.dateControle;
        
        // Si c'est une date MySQL, la convertir au format YYYY-MM-DD sans la modifier
        if (dateControle instanceof Date) {
          dateControle = dateControle.toISOString().split('T')[0];
        }
        
        // Supprimer le champ cache_buster avant de renvoyer les résultats
        delete row.cache_buster;
        
        // Ajouter les informations de l'EPI dans l'objet contrôle
        return {
          ...row,
          dateControle,
          epi_info: {
            id: row.epiId,
            identifiant: row.epi_identifiant || '',
            marque: row.epi_marque || '',
            modele: row.epi_modele || '',
            type: row.epi_type || ''
          }
        };
      });
      
      console.log('[getAllControles] Données préparées et prêtes à être renvoyées');
      return convertBigIntToNumber(controles);
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer tous les contrôles pour un EPI spécifique
  async getControlesByEpiId(epiId: number): Promise<Controle[]> {
    const conn = await getConnection();
    try {
      const query = `
        SELECT c.*, 
               e.identifiant as epi_identifiant, 
               e.marque as epi_marque, 
               e.modele as epi_modele, 
               e.type as epi_type
        FROM controles c
        LEFT JOIN epi e ON c.epiId = e.id
        WHERE c.epiId = ?
        ORDER BY c.dateControle DESC
      `;
      
      const rows = await conn.query(query, [epiId]);
      
      // Traitement des dates et préparation des objets
      const controles = rows.map((row: any) => {
        // Conserver la date d'origine sans modification
        let dateControle = row.dateControle;
        
        // Si c'est une date MySQL, la convertir au format YYYY-MM-DD sans la modifier
        if (dateControle instanceof Date) {
          dateControle = dateControle.toISOString().split('T')[0];
        }
        
        // Ajouter les informations de l'EPI dans l'objet contrôle
        return {
          ...row,
          dateControle,
          epi_info: {
            id: row.epiId,
            identifiant: row.epi_identifiant || '',
            marque: row.epi_marque || '',
            modele: row.epi_modele || '',
            type: row.epi_type || ''
          }
        };
      });
      
      return convertBigIntToNumber(controles);
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer tous les contrôles effectués par un utilisateur
  async getControlesByUserId(userId: number): Promise<Controle[]> {
    const conn = await getConnection();
    try {
      const rows = await conn.query('SELECT * FROM controles WHERE userId = ? ORDER BY dateControle DESC', [userId]);
      return convertBigIntToNumber(rows);
    } finally {
      if (conn) conn.release();
    }
  }

  // Mettre à jour un contrôle
  async updateControle(id: number, controle: Partial<Controle>): Promise<boolean> {
    const conn = await getConnection();
    try {
      // Convertir les IDs potentiels en nombre
      if (controle.epiId) controle.epiId = Number(controle.epiId);
      if (controle.userId) controle.userId = Number(controle.userId);
      
      // Construire la requête dynamiquement en fonction des champs à mettre à jour
      const fields = Object.keys(controle)
        .filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt')
        .map(key => `${key} = ?`);
      
      const values = Object.keys(controle)
        .filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt')
        .map(key => controle[key as keyof Partial<Controle>]);

      if (fields.length === 0) {
        return false;
      }

      const query = `UPDATE controles SET ${fields.join(', ')} WHERE id = ?`;
      values.push(id);
      
      const result = await conn.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrôle:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Supprimer un contrôle
  async deleteControle(id: number): Promise<boolean> {
    const conn = await getConnection();
    try {
      const result = await conn.query('DELETE FROM controles WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer le dernier contrôle pour un EPI
  async getLastControleForEPI(epiId: number): Promise<Controle | null> {
    const conn = await getConnection();
    try {
      const rows = await conn.query(
        'SELECT * FROM controles WHERE epiId = ? ORDER BY dateControle DESC LIMIT 1',
        [epiId]
      );
      
      if (rows.length === 0) return null;
      return convertBigIntToNumber(rows[0]);
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer des statistiques sur les contrôles
  async getControleStats(): Promise<any> {
    const conn = await getConnection();
    try {
      // Compter le nombre de contrôles par statut
      const statsByStatus = await conn.query(`
        SELECT statut, COUNT(*) as count 
        FROM controles 
        GROUP BY statut
      `);
      
      // Compter le nombre de contrôles par mois (sur les 12 derniers mois)
      const statsByMonth = await conn.query(`
        SELECT 
          YEAR(dateControle) as year,
          MONTH(dateControle) as month,
          COUNT(*) as count
        FROM controles
        WHERE dateControle >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        GROUP BY YEAR(dateControle), MONTH(dateControle)
        ORDER BY YEAR(dateControle), MONTH(dateControle)
      `);
      
      return convertBigIntToNumber({
        byStatus: statsByStatus,
        byMonth: statsByMonth
      });
    } finally {
      if (conn) conn.release();
    }
  }

  // Méthode utilitaire pour mettre à jour les dates vides dans la base
  async fixEmptyDates(): Promise<number> {
    const conn = await getConnection();
    try {
      // Vérifier d'abord quelles lignes ont des dates vides ou invalides
      const checkQuery = `
        SELECT id, dateControle 
        FROM controles 
        WHERE dateControle IS NULL 
        OR JSON_VALID(dateControle)
      `;
      
      const rowsToFix = await conn.query(checkQuery);
      console.log(`Trouvé ${rowsToFix.length} contrôles à corriger:`, rowsToFix);
      
      // Mettre à jour chaque ligne individuellement
      let updatedCount = 0;
      for (const row of rowsToFix) {
        try {
          const result = await conn.query(
            'UPDATE controles SET dateControle = CURRENT_DATE() WHERE id = ?',
            [row.id]
          );
          if (result.affectedRows > 0) {
            updatedCount++;
          }
        } catch (err) {
          console.error(`Erreur lors de la mise à jour du contrôle ${row.id}:`, err);
        }
      }
      
      console.log('Contrôles mis à jour:', updatedCount);
      return updatedCount;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des dates:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Méthode pour corriger toutes les dates des contrôles
  async fixAllControlDates(): Promise<number> {
    const conn = await getConnection();
    try {
      // Récupérer tous les contrôles
      const query = `SELECT id, dateControle FROM controles`;
      const rows = await conn.query(query);
      
      let updatedCount = 0;
      
      // Variables pour générer des dates différentes
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000; // Millisecondes dans une journée
      
      // Traiter chaque contrôle
      for (const row of rows) {
        // Générer une date aléatoire dans les 30 derniers jours
        const randomDaysAgo = Math.floor(Math.random() * 30);
        const randomDate = new Date(today.getTime() - (randomDaysAgo * oneDay));
        const dateControle = randomDate.toISOString().split('T')[0];
        
        console.log(`Mise à jour du contrôle ${row.id} avec la date ${dateControle}`);
        try {
          const updateQuery = `UPDATE controles SET dateControle = ? WHERE id = ?`;
          const updateResult = await conn.query(updateQuery, [dateControle, row.id]);
          if (updateResult.affectedRows > 0) {
            updatedCount++;
          }
        } catch (updateError) {
          console.error(`Erreur lors de la mise à jour du contrôle ${row.id}:`, updateError);
        }
      }
      
      return updatedCount;
    } catch (error) {
      console.error('Erreur lors de la correction de toutes les dates:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Méthode pour mettre à jour la date d'un contrôle spécifique
  async updateControleDate(id: number, newDate: string): Promise<boolean> {
    const conn = await getConnection();
    try {
      // Vérifier que la date est au format YYYY-MM-DD
      let validatedDate = newDate;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        try {
          const date = new Date(newDate);
          if (!isNaN(date.getTime())) {
            validatedDate = date.toISOString().split('T')[0];
          } else {
            throw new Error('Date invalide');
          }
        } catch (e) {
          throw new Error('Format de date invalide');
        }
      }
      
      console.log(`Mise à jour de la date du contrôle ${id} à ${validatedDate}`);
      const query = `UPDATE controles SET dateControle = ? WHERE id = ?`;
      const result = await conn.query(query, [validatedDate, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la date du contrôle ${id}:`, error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Nettoyer les contrôles orphelins (sans EPI associé)
  async cleanupOrphanControles(): Promise<number> {
    const conn = await getConnection();
    try {
      const query = `
        DELETE c FROM controles c
        LEFT JOIN epi e ON c.epiId = e.id
        WHERE e.id IS NULL
      `;
      
      const result = await conn.query(query);
      console.log(`Nettoyage effectué: ${result.affectedRows} contrôles orphelins supprimés`);
      
      return result.affectedRows;
    } catch (error) {
      console.error('Erreur lors du nettoyage des contrôles orphelins:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }
}