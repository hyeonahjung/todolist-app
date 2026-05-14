export interface User {
  userId: number;
  email: string;
  name: string;
  createdAt?: string;
}

export interface UpdateUserRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface DeleteUserRequest {
  password: string;
}
