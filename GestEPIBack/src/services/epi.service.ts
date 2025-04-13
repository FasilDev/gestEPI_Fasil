// src/services/epi.service.ts
import { EPI } from '../models/epi.model';
import { getConnection } from '../config/db.config';
import { format } from 'date-fns';

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

export class EPIService {
  // Créer un nouvel EPI
  async createEPI(epi: EPI): Promise<EPI> {
    const conn = await getConnection();
    try {
      // S'assurer que les dates sont correctement formatées
      let dateAchat = null;
      let dateFabrication = null;
      let dateMiseEnService = null;
      
      try {
        // Vérifier si dateAchat est un objet vide ou une date valide
        if (epi.dateAchat) {
          if (typeof epi.dateAchat === 'object' && Object.keys(epi.dateAchat).length === 0) {
            // C'est un objet vide {}
            dateAchat = null;
          } else {
            dateAchat = new Date(epi.dateAchat);
            if (dateAchat.toString() === 'Invalid Date') dateAchat = null;
          }
        }
        
        // Vérifier si dateFabrication est un objet vide ou une date valide
        if (epi.dateFabrication) {
          if (typeof epi.dateFabrication === 'object' && Object.keys(epi.dateFabrication).length === 0) {
            // C'est un objet vide {}
            dateFabrication = null;
          } else {
            dateFabrication = new Date(epi.dateFabrication);
            if (dateFabrication.toString() === 'Invalid Date') dateFabrication = null;
          }
        }
        
        // La date de mise en service est obligatoire
        if (epi.dateMiseEnService) {
          if (typeof epi.dateMiseEnService === 'object' && Object.keys(epi.dateMiseEnService).length === 0) {
            // C'est un objet vide {}, on utilise la date actuelle
            dateMiseEnService = new Date();
          } else {
            dateMiseEnService = new Date(epi.dateMiseEnService);
            if (dateMiseEnService.toString() === 'Invalid Date') {
              dateMiseEnService = new Date(); // Utiliser la date actuelle en cas d'erreur
            }
          }
        } else {
          dateMiseEnService = new Date();
        }
      } catch (error: any) {
        console.error('Erreur lors du formatage des dates:', error);
        throw new Error(`Erreur lors du formatage des dates: ${error.message}`);
      }
      
      console.log("Dates formatées avant insertion SQL:", {
        dateAchat,
        dateFabrication,
        dateMiseEnService
      });
      
      // Exécuter la requête d'insertion
      try {
        const result = await conn.query(
          'INSERT INTO epi (identifiant, marque, modele, numeroSerie, type, taille, couleur, dateAchat, dateFabrication, dateMiseEnService, frequenceControle) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            epi.identifiant || null,
            epi.marque,
            epi.modele,
            epi.numeroSerie || null,
            epi.type,
            epi.taille || null,
            epi.couleur || null,
            dateAchat,
            dateFabrication,
            dateMiseEnService,
            epi.frequenceControle
          ]
        );

        // Convertir l'ID de BigInt à Number
        const insertId = Number(result.insertId);
        return convertBigIntToNumber({ 
          ...epi, 
          id: insertId,
          dateAchat: dateAchat ? format(dateAchat, 'yyyy-MM-dd') : null,
          dateFabrication: dateFabrication ? format(dateFabrication, 'yyyy-MM-dd') : null,
          dateMiseEnService: format(dateMiseEnService, 'yyyy-MM-dd')
        });
      } catch (sqlError: any) {
        console.error('Erreur SQL lors de l\'insertion:', sqlError);
        throw new Error(`Erreur lors de l'insertion dans la base de données: ${sqlError.message}`);
      }
    } catch (error: any) {
      console.error('Erreur globale dans createEPI:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer un EPI par son ID
  async getEPIById(id: number): Promise<EPI | null> {
    const conn = await getConnection();
    try {
      const rows = await conn.query('SELECT * FROM epi WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      
      const epi = rows[0];
      let formattedEpi = { ...epi };
      
      // Formater la date de mise en service si elle existe
      if (epi.dateMiseEnService && epi.dateMiseEnService instanceof Date) {
        formattedEpi.dateMiseEnService = format(epi.dateMiseEnService, 'yyyy-MM-dd');
      }
      
      // Formater la date d'achat si elle existe
      if (epi.dateAchat && epi.dateAchat instanceof Date) {
        formattedEpi.dateAchat = format(epi.dateAchat, 'yyyy-MM-dd');
      }
      
      // Formater la date de fabrication si elle existe
      if (epi.dateFabrication && epi.dateFabrication instanceof Date) {
        formattedEpi.dateFabrication = format(epi.dateFabrication, 'yyyy-MM-dd');
      }
      
      return convertBigIntToNumber(formattedEpi);
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer tous les EPIs
  async getAllEPIs(): Promise<EPI[]> {
    const conn = await getConnection();
    try {
      const rows = await conn.query('SELECT * FROM epi');
      
      // Convertir les dates en chaînes pour faciliter le traitement côté frontend
      const formattedRows = rows.map((row: any) => {
        let formattedRow = { ...row };
        
        // Formater la date de mise en service si elle existe
        if (row.dateMiseEnService && row.dateMiseEnService instanceof Date) {
          formattedRow.dateMiseEnService = format(row.dateMiseEnService, 'yyyy-MM-dd');
        } else if (!row.dateMiseEnService || 
                  (typeof row.dateMiseEnService === 'object' && Object.keys(row.dateMiseEnService).length === 0)) {
          // Si la date est manquante ou un objet vide, utiliser la date actuelle
          formattedRow.dateMiseEnService = format(new Date(), 'yyyy-MM-dd');
        }
        
        // Formater les autres dates si elles existent
        if (row.dateAchat && row.dateAchat instanceof Date) {
          formattedRow.dateAchat = format(row.dateAchat, 'yyyy-MM-dd');
        }
        
        if (row.dateFabrication && row.dateFabrication instanceof Date) {
          formattedRow.dateFabrication = format(row.dateFabrication, 'yyyy-MM-dd');
        }
        
        return formattedRow;
      });
      
      return convertBigIntToNumber(formattedRows);
    } finally {
      if (conn) conn.release();
    }
  }

  // Mettre à jour un EPI
  async updateEPI(id: number, epi: Partial<EPI>): Promise<boolean> {
    const conn = await getConnection();
    try {
      // Gérer les dates
      let updates: any = { ...epi };
      
      try {
        if (updates.dateAchat) {
          updates.dateAchat = new Date(updates.dateAchat);
          if (updates.dateAchat.toString() === 'Invalid Date') updates.dateAchat = null;
        }
        
        if (updates.dateFabrication) {
          updates.dateFabrication = new Date(updates.dateFabrication);
          if (updates.dateFabrication.toString() === 'Invalid Date') updates.dateFabrication = null;
        }
        
        if (updates.dateMiseEnService) {
          updates.dateMiseEnService = new Date(updates.dateMiseEnService);
          if (updates.dateMiseEnService.toString() === 'Invalid Date') {
            throw new Error('La date de mise en service est invalide');
          }
        }
      } catch (error: any) {
        console.error('Erreur lors du formatage des dates pour la mise à jour:', error);
        throw new Error(`Erreur lors du formatage des dates: ${error.message}`);
      }
      
      // Construire la requête dynamiquement en fonction des champs à mettre à jour
      const fields = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt')
        .map(key => `${key} = ?`);
      
      const values = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt')
        .map(key => updates[key]);

      if (fields.length === 0) return false;

      const query = `UPDATE epi SET ${fields.join(', ')} WHERE id = ?`;
      values.push(id);

      const result = await conn.query(query, values);
      return result.affectedRows > 0;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'EPI:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Supprimer un EPI
  async deleteEPI(id: number): Promise<boolean> {
    const conn = await getConnection();
    try {
      // Commencer une transaction
      await conn.beginTransaction();
      
      try {
        // 1. Supprimer d'abord tous les contrôles associés à cet EPI
        console.log(`Suppression des contrôles liés à l'EPI ${id}...`);
        await conn.query('DELETE FROM controles WHERE epiId = ?', [id]);
        
        // 2. Puis supprimer l'EPI lui-même
        console.log(`Suppression de l'EPI ${id}...`);
        const result = await conn.query('DELETE FROM epi WHERE id = ?', [id]);
        
        // Valider la transaction
        await conn.commit();
        
        return result.affectedRows > 0;
      } catch (error) {
        // En cas d'erreur, annuler la transaction
        await conn.rollback();
        console.error('Erreur lors de la suppression de l\'EPI et de ses contrôles:', error);
        throw error;
      }
    } finally {
      if (conn) conn.release();
    }
  }

  // Récupérer les EPIs qui ont besoin d'un contrôle dans les prochains jours
  async getEPIsNeedingControl(days: number = 30): Promise<EPI[]> {
    const conn = await getConnection();
    try {
      // Requête SQL pour trouver les EPIs qui ont besoin d'un contrôle
      const query = `
        SELECT e.*, 
               MAX(c.dateControle) as lastControlDate,
               DATEDIFF(
                 COALESCE(
                   DATE_ADD(MAX(c.dateControle), INTERVAL e.frequenceControle MONTH),
                   DATE_ADD(e.dateMiseEnService, INTERVAL e.frequenceControle MONTH)
                 ),
                 CURRENT_DATE()
               ) as daysRemaining,
               DATE_ADD(
                 COALESCE(
                   MAX(c.dateControle),
                   e.dateMiseEnService
                 ),
                 INTERVAL e.frequenceControle MONTH
               ) as nextControlDate
        FROM epi e
        LEFT JOIN controles c ON e.id = c.epiId
        GROUP BY e.id
        HAVING daysRemaining IS NOT NULL
        ORDER BY daysRemaining ASC
      `;
      
      const rows = await conn.query(query, []);
      
      // Filtrer les résultats pour ne conserver que les EPIs dans l'intervalle demandé
      const filteredRows = rows.filter((row: any) => {
        // Vérifier si daysRemaining existe et est un nombre
        if (row.daysRemaining !== undefined && row.daysRemaining !== null) {
          // Convertir en nombre pour être sûr
          const daysValue = Number(row.daysRemaining);
          // Inclure cet EPI s'il est dans l'intervalle demandé (entre -∞ et +days)
          return !isNaN(daysValue) && daysValue <= days;
        }
        return false;
      });
      
      // Convertir les dates en chaînes pour faciliter le traitement côté frontend
      const formattedRows = filteredRows.map((row: any) => {
        let formattedRow = { ...row };
        
        // Formater la date du dernier contrôle si elle existe
        if (row.lastControlDate && row.lastControlDate instanceof Date) {
          formattedRow.lastControlDate = format(row.lastControlDate, 'yyyy-MM-dd');
        } else {
          // Ne pas inclure une date vide ou null
          formattedRow.lastControlDate = null;
        }
        
        // Formater la date du prochain contrôle si elle existe
        if (row.nextControlDate && row.nextControlDate instanceof Date) {
          formattedRow.nextControlDate = format(row.nextControlDate, 'yyyy-MM-dd');
        } else {
          // Ne pas inclure une date vide ou null
          formattedRow.nextControlDate = null;
        }
        
        // Formater la date de mise en service si elle existe
        if (row.dateMiseEnService && row.dateMiseEnService instanceof Date) {
          formattedRow.dateMiseEnService = format(row.dateMiseEnService, 'yyyy-MM-dd');
        } else {
          // Si la date est manquante ou un objet vide, envoyer null
          formattedRow.dateMiseEnService = null;
        }
        
        // S'assurer que daysRemaining est un nombre valide
        if (formattedRow.daysRemaining !== undefined && formattedRow.daysRemaining !== null) {
          formattedRow.daysRemaining = Number(formattedRow.daysRemaining);
        } else {
          formattedRow.daysRemaining = 0; // Par défaut, contrôle immédiat
        }
        
        return formattedRow;
      });
      
      return convertBigIntToNumber(formattedRows);
    } finally {
      if (conn) conn.release();
    }
  }

  // Corriger les dates de mise en service manquantes ou invalides
  async fixMissingServiceDates(): Promise<number> {
    const conn = await getConnection();
    try {
      // Date actuelle au format SQL
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      
      // Mettre à jour les EPIs qui ont des dates de mise en service NULL ou invalides
      const query = `
        UPDATE epi 
        SET dateMiseEnService = ? 
        WHERE dateMiseEnService IS NULL 
           OR (dateMiseEnService = '0000-00-00') 
           OR (dateMiseEnService = '')
      `;
      
      const result = await conn.query(query, [currentDate]);
      
      // Retourner le nombre de lignes affectées
      return result.affectedRows;
    } catch (error: any) {
      console.error('Erreur lors de la correction des dates de mise en service:', error);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }
}