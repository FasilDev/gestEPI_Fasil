import { Request, Response } from 'express';
import { EPIService } from '../services/epi.service';

const epiService = new EPIService();

export class EPIController {
  // Créer un nouvel EPI
  async createEPI(req: Request, res: Response): Promise<void> {
    try {
      const epi = req.body;
      
      // Log détaillé pour diagnostiquer le problème
      console.log("Données EPI reçues:", JSON.stringify(epi, null, 2));
      
      // Vérifier que les champs obligatoires sont présents
      if (!epi.marque || !epi.modele || !epi.type || !epi.frequenceControle) {
        res.status(400).json({
          success: false,
          error: 'Veuillez fournir tous les champs obligatoires'
        });
        return;
      }
      
      // S'assurer que la dateMiseEnService existe, sinon utiliser la date actuelle
      if (!epi.dateMiseEnService) {
        epi.dateMiseEnService = new Date().toISOString().split('T')[0];
        console.log("Date de mise en service automatique:", epi.dateMiseEnService);
      }
      
      // Vérifier que la date de mise en service est valide
      const dateMiseEnService = new Date(epi.dateMiseEnService);
      console.log("Date de mise en service après conversion:", dateMiseEnService);
      
      if (dateMiseEnService.toString() === 'Invalid Date') {
        console.error("Date de mise en service invalide:", epi.dateMiseEnService);
        res.status(400).json({
          success: false,
          error: 'La date de mise en service est invalide'
        });
        return;
      }
      
      // Si la date est fournie comme objet Date, la convertir en chaîne de format YYYY-MM-DD
      if (epi.dateMiseEnService instanceof Date) {
        epi.dateMiseEnService = epi.dateMiseEnService.toISOString().split('T')[0];
      }
      
      try {
        const result = await epiService.createEPI(epi);
        res.status(201).json({
          success: true,
          data: result
        });
      } catch (error: any) {
        console.error('Erreur spécifique lors de la création de l\'EPI:', error.message);
        res.status(400).json({
          success: false,
          error: `Erreur lors de la création de l'EPI: ${error.message}`
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'EPI:', error);
      res.status(500).json({
        success: false,
        error: `Erreur lors de la création de l'EPI: ${error.message || 'Erreur inconnue'}`
      });
    }
  }

  // Récupérer tous les EPIs
  async getAllEPIs(req: Request, res: Response): Promise<void> {
    try {
      const epis = await epiService.getAllEPIs();
      res.status(200).json({
        success: true,
        data: epis
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des EPIs:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des EPIs'
      });
    }
  }

  // Récupérer un EPI par son ID
  async getEPIById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const epi = await epiService.getEPIById(id);
      
      if (!epi) {
        res.status(404).json({
          success: false,
          error: 'EPI non trouvé'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: epi
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'EPI:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de l\'EPI'
      });
    }
  }

  // Mettre à jour un EPI
  async updateEPI(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const epiData = req.body;
      
      const epi = await epiService.getEPIById(id);
      if (!epi) {
        res.status(404).json({
          success: false,
          error: 'EPI non trouvé'
        });
        return;
      }
      
      const updatedEPI = await epiService.updateEPI(id, epiData);
      res.status(200).json({
        success: true,
        data: updatedEPI
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'EPI:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour de l\'EPI'
      });
    }
  }

  // Supprimer un EPI
  async deleteEPI(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      const epi = await epiService.getEPIById(id);
      if (!epi) {
        res.status(404).json({
          success: false,
          error: 'EPI non trouvé'
        });
        return;
      }
      
      await epiService.deleteEPI(id);
      res.status(200).json({
        success: true,
        message: 'EPI supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'EPI:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression de l\'EPI'
      });
    }
  }

  // Récupérer les EPIs qui nécessitent un contrôle
  async getEPIsNeedingControl(req: Request, res: Response): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const epis = await epiService.getEPIsNeedingControl(days);
      
      res.status(200).json({
        success: true,
        data: epis
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des EPIs nécessitant un contrôle:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des EPIs nécessitant un contrôle'
      });
    }
  }

  // Corriger les dates de mise en service manquantes
  async fixMissingServiceDates(req: Request, res: Response): Promise<void> {
    try {
      const result = await epiService.fixMissingServiceDates();
      
      res.status(200).json({
        success: true,
        data: { updated: result }
      });
    } catch (error) {
      console.error('Erreur lors de la correction des dates de mise en service:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la correction des dates de mise en service'
      });
    }
  }
} 