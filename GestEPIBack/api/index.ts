import app from "../src/app";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import epiRoutes from './routes/epi.routes';
import controleRoutes from './routes/controle.routes';

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/epis', epiRoutes);
app.use('/api/controles', controleRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API GestEPI opérationnelle' });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

export default app;