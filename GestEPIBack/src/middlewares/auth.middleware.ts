// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Middleware pour vérifier le token JWT
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    // Extraire le token (format: "Bearer <token>")
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token non fourni' });
    }
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    
    // Ajouter les informations de l'utilisateur à la requête
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token invalide' });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expiré' });
    }
    
    return res.status(500).json({ message: 'Erreur d\'authentification' });
  }
};

// Middleware pour vérifier le rôle d'administrateur
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!(req as any).user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    // Vérifier si l'utilisateur est un administrateur
    if ((req as any).user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès refusé, droits d\'administrateur requis' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur d\'autorisation' });
  }
};

// Middleware pour vérifier le rôle de gestionnaire (ou administrateur)
export const managerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!(req as any).user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    // Vérifier si l'utilisateur est un gestionnaire ou un administrateur
    if ((req as any).user.type !== 'MANAGER' && (req as any).user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès refusé, droits de gestionnaire requis' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur d\'autorisation' });
  }
};