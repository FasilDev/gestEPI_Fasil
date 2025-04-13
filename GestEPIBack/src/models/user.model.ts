export interface User {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    type: 'ADMIN' | 'MANAGER' | 'USER';
    createdAt?: Date;
    updatedAt?: Date;
  }