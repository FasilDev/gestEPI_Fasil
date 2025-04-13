export interface EPI {
    id?: number;
    identifiant?: string;
    marque: string;
    modele: string;
    numeroSerie?: string;
    type: string;
    taille?: string;
    couleur?: string;
    dateAchat?: Date;
    dateFabrication?: Date;
    dateMiseEnService: Date;
    frequenceControle: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
