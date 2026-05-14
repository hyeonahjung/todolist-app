export type Theme = 'light' | 'dark';
export type Language = 'ko' | 'en' | 'zh' | 'ja' | 'es';

export interface User {
  userId: number;
  email: string;
  name: string;
  theme: Theme;
  language: Language;
  createdAt?: string;
}

export interface UpdateUserRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  theme?: Theme;
  language?: Language;
}

export interface DeleteUserRequest {
  password: string;
}
