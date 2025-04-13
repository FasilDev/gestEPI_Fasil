import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

// Routes publiques
router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));

// Routes protégées
router.get('/profile', authMiddleware, userController.getCurrentUser.bind(userController));
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers.bind(userController));
router.get('/:id', authMiddleware, userController.getUserById.bind(userController));
router.put('/:id', authMiddleware, userController.updateUser.bind(userController));
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser.bind(userController));

export default router;