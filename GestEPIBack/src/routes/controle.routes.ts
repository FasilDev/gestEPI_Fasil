import express from 'express';
import { ControleController } from '../controllers/controle.controller';

const router = express.Router();
const controleController = new ControleController();

// Routes pour les contrôles
router.get('/', controleController.getAllControles.bind(controleController));
router.get('/stats', controleController.getControleStats.bind(controleController));
router.post('/fix-dates', controleController.fixAllDates.bind(controleController));
router.get('/cleanup-orphans', controleController.cleanupOrphanControles.bind(controleController));
router.post('/:id/update-date', controleController.updateControleDate.bind(controleController));
router.get('/epi/:epiId', controleController.getControlesByEpiId.bind(controleController));
router.get('/:id', controleController.getControleById.bind(controleController));
router.post('/', controleController.createControle.bind(controleController));
router.put('/:id', controleController.updateControle.bind(controleController));
router.delete('/:id', controleController.deleteControle.bind(controleController));

export default router;