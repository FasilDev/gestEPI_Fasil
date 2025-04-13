//********** Imports **********//
import express from "express";
import cors from "cors";
import * as middlewares from "./middlewares";
import epiRoutes from './routes/epi.routes';
import controleRoutes from './routes/controle.routes';
import userRoutes from './routes/user.routes';
import { UserService } from './services/user.service';
import bcrypt from 'bcrypt';

require("dotenv").config();

//********** Server **********//
const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true // Autoriser les credentials
};
// Initializing express.
const app = express();
// Enable CORS
app.use(cors(options));
// Middleware to parse json throught requests.
app.use(express.json());

// Route de base pour tester l'API
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API GestEPI',
    endpoints: {
      epis: '/api/epis',
      controles: '/api/controles',
      users: '/api/users'
    }
  });
});

// Routes de l'API
app.use('/api/epis', epiRoutes);
app.use('/api/controles', controleRoutes);
app.use('/api/users', userRoutes);

// Créer un utilisateur admin par défaut au démarrage
const initializeDefaultUser = async () => {
  try {
    const userService = new UserService();
    const existingUser = await userService.getUserByEmail('admin@example.com');
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await userService.createUser({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        type: 'ADMIN'
      });
      console.log('Utilisateur admin par défaut créé avec succès');
      console.log('Email: admin@example.com, Mot de passe: password123');
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
  }
};

initializeDefaultUser();

// Middleware pour gérer les erreurs, doit être placé APRÈS les routes
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
