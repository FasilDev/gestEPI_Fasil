// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userService = new UserService();

export class UserController {
  // Inscription d'un nouvel utilisateur
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, email, password, phone, type } = req.body;
      
      // Vérifier que les champs obligatoires sont présents
      if (!firstName || !lastName || !email || !password) {
        res.status(400).json({ message: 'Veuillez fournir tous les champs requis' });
        return;
      }
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ message: 'Cet email est déjà utilisé' });
        return;
      }
      
      // Créer l'utilisateur
      const newUser = await userService.createUser({
        firstName,
        lastName,
        email,
        password,
        phone,
        type: type || 'USER'
      });
      
      // Ne pas renvoyer le mot de passe dans la réponse
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
  }
  
  // Connexion d'un utilisateur
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      // Vérifier que les champs obligatoires sont présents
      if (!email || !password) {
        res.status(400).json({ message: 'Veuillez fournir email et mot de passe' });
        return;
      }
      
      // Vérifier les identifiants
      const user = await userService.validateCredentials(email, password);
      if (!user) {
        res.status(401).json({ message: 'Identifiants invalides' });
        return;
      }
      
      // Créer un token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, type: user.type },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '24h' }
      );
      
      res.status(200).json({ user, token });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  }
  
  // Récupérer tous les utilisateurs
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
  }
  
  // Récupérer un utilisateur par son ID
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.getUserById(id);
      
      if (!user) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  }
  
  // Mettre à jour un utilisateur
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Vérifier si l'utilisateur existe
      const existingUser = await userService.getUserById(id);
      if (!existingUser) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }
      
      // Mettre à jour l'utilisateur
      const success = await userService.updateUser(id, updateData);
      
      if (!success) {
        res.status(400).json({ message: 'Échec de la mise à jour de l\'utilisateur' });
        return;
      }
      
      // Récupérer l'utilisateur mis à jour
      const updatedUser = await userService.getUserById(id);
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
  }
  
  // Supprimer un utilisateur 
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      // Vérifier si l'utilisateur existe
      const existingUser = await userService.getUserById(id);
      if (!existingUser) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }
      
      // Supprimer l'utilisateur
      const success = await userService.deleteUser(id);
      
      if (!success) {
        res.status(400).json({ message: 'Échec de la suppression de l\'utilisateur' });
        return;
      }
      
      res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }
  }
  
  // Obtenir le profil de l'utilisateur courant
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // Récupérer l'ID de l'utilisateur depuis le token JWT
      const userId = (req as any).user.id;
      
      const user = await userService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
    }
  }
}