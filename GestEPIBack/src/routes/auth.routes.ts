import express from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = express.Router();
const authController = new AuthController();

// Route de connexion
router.post('/login', authController.login.bind(authController));

// Route d'inscription (si applicable)
router.post('/register', authController.register.bind(authController));

export default router; 