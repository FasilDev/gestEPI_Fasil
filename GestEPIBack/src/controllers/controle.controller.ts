import { Request, Response } from 'express';
import { ControleService } from '../services/controle.service';
import { EPIService } from '../services/epi.service';

const controleService = new ControleService();
const epiService = new EPIService();

export class ControleController {
  // Créer un nouveau contrôle
  async createControle(req: Request, res: Response): Promise<void> {
    try {
      console.log("Données de contrôle reçues:", JSON.stringify(req.body, null, 2));
      
      const { epiId, dateControle, statut, commentaire, userId } = req.body;
      
      // Vérifier que les champs obligatoires sont présents
      if (!epiId || !dateControle || !statut) {
        res.status(400).json({ 
          success: false,
          error: 'Veuillez fournir tous les champs requis' 
        });
        return;
      }
      
      // Convertir explicitement epiId en Number pour éviter les problèmes de BigInt
      const epiIdNumber = Number(epiId);
      
      // Vérifier si l'EPI existe
      const epi = await epiService.getEPIById(epiIdNumber);
      if (!epi) {
        res.status(404).json({
          success: false,
          error: 'EPI non trouvé' 
        });
        return;
      }
      
      // Utiliser l'userId fourni ou un userId par défaut (pour contourner l'authentification)
      const userIdToUse = userId ? Number(userId) : 1; // Convertir également en Number
      
      // Formater la date
      const formattedDateControle = new Date(dateControle);
      if (formattedDateControle.toString() === 'Invalid Date') {
        res.status(400).json({
          success: false,
          error: 'La date de contrôle est invalide'
        });
        return;
      }
      
      console.log("Création d'un contrôle avec les données:", {
        epiId: epiIdNumber, // Utiliser la version Number
        userId: userIdToUse,
        dateControle: formattedDateControle,
        statut,
        commentaire
      });
      
      // Créer le contrôle
      try {
        const newControle = await controleService.createControle({
          epiId: epiIdNumber, // Utiliser la version Number
          userId: userIdToUse,
          dateControle: formattedDateControle,
          statut,
          commentaire
        });
        
        // Convertir explicitement l'ID en nombre avant de le renvoyer
        if (newControle.id && typeof newControle.id === 'bigint') {
          newControle.id = Number(newControle.id);
        }
        
        res.status(201).json({
          success: true,
          data: newControle
        });
      } catch (createError: any) {
        console.error('Erreur spécifique lors de la création:', createError);
        res.status(400).json({
          success: false,
          error: `Erreur lors de la création du contrôle: ${createError.message}`
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du contrôle:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la création du contrôle: ${error.message || 'Erreur inconnue'}`
      });
    }
  }
  
  // Récupérer tous les contrôles
  async getAllControles(req: Request, res: Response): Promise<void> {
    try {
      const controles = await controleService.getAllControles();
      res.status(200).json({
        success: true,
        data: controles
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des contrôles:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la récupération des contrôles: ${error.message || 'Erreur inconnue'}`
      });
    }
  }
  
  // Récupérer un contrôle par son ID
  async getControleById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const controle = await controleService.getControleById(id);
      
      if (!controle) {
        res.status(404).json({
          success: false,
          error: 'Contrôle non trouvé'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: controle
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération du contrôle:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la récupération du contrôle: ${error.message || 'Erreur inconnue'}`
      });
    }
  }
  
  // Récupérer tous les contrôles pour un EPI spécifique
  async getControlesByEpiId(req: Request, res: Response): Promise<void> {
    try {
      const epiId = parseInt(req.params.epiId);
      
      // Vérifier si l'EPI existe
      const epi = await epiService.getEPIById(epiId);
      if (!epi) {
        res.status(404).json({
          success: false,
          error: 'EPI non trouvé'
        });
        return;
      }
      
      const controles = await controleService.getControlesByEpiId(epiId);
      res.status(200).json({
        success: true,
        data: controles
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des contrôles de l\'EPI:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la récupération des contrôles de l'EPI: ${error.message || 'Erreur inconnue'}`
      });
    }
  }
  
  // Mettre à jour un contrôle
  async updateControle(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Vérifier si le contrôle existe
      const existingControle = await controleService.getControleById(id);
      if (!existingControle) {
        res.status(404).json({
          success: false,
          error: 'Contrôle non trouvé'
        });
        return;
      }
      
      // Mettre à jour le contrôle
      const success = await controleService.updateControle(id, updateData);
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Échec de la mise à jour du contrôle'
        });
        return;
      }
      
      // Récupérer le contrôle mis à jour
      const updatedControle = await controleService.getControleById(id);
      
      res.status(200).json({
        success: true,
        data: updatedControle
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du contrôle:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la mise à jour du contrôle: ${error.message || 'Erreur inconnue'}`
      });
    }
  }
  
  // Supprimer un contrôle
  async deleteControle(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      // Vérifier si le contrôle existe
      const existingControle = await controleService.getControleById(id);
      if (!existingControle) {
        res.status(404).json({
          success: false,
          error: 'Contrôle non trouvé'
        });
        return;
      }
      
      // Supprimer le contrôle
      const success = await controleService.deleteControle(id);
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Échec de la suppression du contrôle'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Contrôle supprimé avec succès'
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression du contrôle:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la suppression du contrôle: ${error.message || 'Erreur inconnue'}`
      });
    }
  }
  
  // Récupérer les statistiques sur les contrôles
  async getControleStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await controleService.getControleStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques de contrôle:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la récupération des statistiques de contrôle: ${error.message || 'Erreur inconnue'}`
      });
    }
  }

  // Réparer les dates vides dans la base de données
  async fixEmptyDates(req: Request, res: Response): Promise<void> {
    try {
      const updatedCount = await controleService.fixEmptyDates();
      
      res.status(200).json({
        success: true,
        message: `${updatedCount} dates ont été corrigées avec succès`,
        data: { updatedCount }
      });
    } catch (error: any) {
      console.error('Erreur lors de la réparation des dates:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la réparation des dates: ${error.message}`
      });
    }
  }

  // Réparer manuellement les dates vides dans la base de données
  async fixEmptyDatesManual(req: Request, res: Response): Promise<void> {
    try {
      // Récupérer tous les contrôles
      const controles = await controleService.getAllControles();
      let updatedCount = 0;
      
      // Pour chaque contrôle, vérifier si la date est valide
      for (const controle of controles) {
        if (!controle.dateControle || 
            typeof controle.dateControle === 'object' && Object.keys(controle.dateControle).length === 0) {
          
          // Préparer les données de mise à jour avec la date actuelle
          const updateData = {
            dateControle: new Date().toISOString().split('T')[0]
          };
          
          // Mettre à jour le contrôle
          if (controle.id) {
            const success = await controleService.updateControle(controle.id, updateData);
            if (success) {
              updatedCount++;
            }
          }
        }
      }
      
      res.status(200).json({
        success: true,
        message: `${updatedCount} dates ont été corrigées avec succès`,
        data: { updatedCount }
      });
    } catch (error: any) {
      console.error('Erreur lors de la réparation manuelle des dates:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la réparation manuelle des dates: ${error.message}`
      });
    }
  }

  // Réparer toutes les dates des contrôles
  async fixAllDates(req: Request, res: Response): Promise<void> {
    try {
      const updatedCount = await controleService.fixAllControlDates();
      
      res.status(200).json({
        success: true,
        message: `${updatedCount} dates ont été corrigées avec succès`,
        data: { updatedCount }
      });
    } catch (error: any) {
      console.error('Erreur lors de la correction des dates:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la correction des dates: ${error.message}`
      });
    }
  }

  // Mettre à jour la date d'un contrôle spécifique
  async updateControleDate(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { newDate } = req.body;
      
      if (!newDate) {
        res.status(400).json({
          success: false,
          error: 'La nouvelle date est requise'
        });
        return;
      }
      
      // Vérifier si le contrôle existe
      const existingControle = await controleService.getControleById(id);
      if (!existingControle) {
        res.status(404).json({
          success: false,
          error: 'Contrôle non trouvé'
        });
        return;
      }
      
      const success = await controleService.updateControleDate(id, newDate);
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Échec de la mise à jour de la date du contrôle'
        });
        return;
      }
      
      // Récupérer le contrôle mis à jour
      const updatedControle = await controleService.getControleById(id);
      res.status(200).json({
        success: true,
        data: updatedControle
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la date du contrôle:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la mise à jour de la date du contrôle: ${error.message || 'Erreur inconnue'}`
      });
    }
  }

  // Nettoyer les contrôles orphelins (sans EPI associé)
  async cleanupOrphanControles(req: Request, res: Response): Promise<void> {
    try {
      const deletedCount = await controleService.cleanupOrphanControles();
      
      res.status(200).json({
        success: true,
        message: `${deletedCount} contrôles orphelins supprimés avec succès`
      });
    } catch (error: any) {
      console.error('Erreur lors du nettoyage des contrôles orphelins:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors du nettoyage des contrôles orphelins: ${error.message || 'Erreur inconnue'}`
      });
    }
  }
}