// Type pour représenter un utilisateur
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  type: UserType;
  phone?: string;
}

// Énumération des types d'utilisateurs
export enum UserType {
  ADMIN = 1,
  MANAGER = 2,
  USER = 3,
}

// Type pour représenter un EPI
export interface EPI {
  id?: number;
  identifiant?: string;
  marque: string;
  modele: string;
  numeroSerie?: string;
  type: string;
  taille?: string;
  couleur?: string;
  dateAchat?: Date | string;
  dateFabrication?: Date | string;
  dateMiseEnService: Date | string;
  frequenceControle: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Type pour représenter un contrôle d'EPI
export interface Controle {
  id?: number;
  epiId: number;
  userId: number;
  dateControle: Date | string;
  statut: 'Opérationnel' | 'À réparer' | 'Mis au rebut';
  commentaire?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Pour l'affichage dans l'UI
  epi?: EPI;
  epi_info?: {
    id: number;
    identifiant?: string;
    marque: string;
    modele: string;
    type: string;
  };
  user?: User;
}

// Types de statut de contrôle
export enum ControleStatut {
  OPERATIONNEL = 'Opérationnel',
  A_REPARER = 'À réparer',
  MIS_AU_REBUT = 'Mis au rebut',
}

// Types d'EPI
export enum EPIType {
  CORDE = 'CORDE',
  SANGLE = 'SANGLE',
  LONGE = 'LONGE',
  BAUDRIER = 'BAUDRIER',
  CASQUE = 'CASQUE',
  MOUSQUETON = 'MOUSQUETON',
  AUTRE = 'AUTRE',
}

// Format pour l'affichage
export interface EPIDisplay extends EPI {
  prochainControle?: Date | string;
  jourRestants?: number;
  statut?: string;
  dernierControle?: Controle;
  lastControlDate?: Date | string | null;
}

// État global de l'application
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
