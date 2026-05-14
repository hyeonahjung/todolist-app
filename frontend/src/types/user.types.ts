export type Theme = 'light' | 'dark';

export interface User {
  userId: number;
  email: string;
  name: string;
  theme: Theme;
  createdAt?: string;
}

export interface UpdateUserRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  theme?: Theme;
}

export interface DeleteUserRequest {
  password: string;
}
