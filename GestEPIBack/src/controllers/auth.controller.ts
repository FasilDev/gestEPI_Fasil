import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userService = new UserService();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      // Vérifier que l'utilisateur existe
      const user = await userService.getUserByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Email ou mot de passe incorrect'
        });
        return;
      }
      
      // Vérifier le mot de passe
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        res.status(401).json({
          success: false,
          error: 'Email ou mot de passe incorrect'
        });
        return;
      }
      
      // Générer un token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, type: user.type },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '8h' }
      );
      
      // Envoyer la réponse
      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            type: user.type
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la connexion'
      });
    }
  }
  
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: User = req.body;
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await userService.getUserByEmail(userData.email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'Un utilisateur avec cet email existe déjà'
        });
        return;
      }
      
      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      // Créer l'utilisateur
      const newUser = await userService.createUser(userData);
      
      // Générer un token JWT
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, type: newUser.type },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '8h' }
      );
      
      // Envoyer la réponse
      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            type: newUser.type
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'inscription'
      });
    }
  }
} 