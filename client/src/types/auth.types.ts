export type UserRole = 'donor' | 'hospital' | 'admin';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  profile?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}
