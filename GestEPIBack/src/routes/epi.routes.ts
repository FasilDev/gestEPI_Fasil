// src/routes/epi.routes.ts
import express from 'express';
import { EPIController } from '../controllers/epi.controller';

const router = express.Router();
const epiController = new EPIController();

// Routes pour les EPIs
router.post('/', epiController.createEPI.bind(epiController));
router.get('/', epiController.getAllEPIs.bind(epiController));
router.get('/need-control', epiController.getEPIsNeedingControl.bind(epiController));
router.post('/fix-missing-dates', epiController.fixMissingServiceDates.bind(epiController));
router.get('/:id', epiController.getEPIById.bind(epiController));
router.put('/:id', epiController.updateEPI.bind(epiController));
router.delete('/:id', epiController.deleteEPI.bind(epiController));

export default router;