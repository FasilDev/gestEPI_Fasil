export interface Controle {
    id?: number;
    epiId: number;
    userId: number;
    dateControle: Date | string;
    statut: 'Opérationnel' | 'À réparer' | 'Mis au rebut';
    commentaire?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }