export interface Todo {
  todoId: number;
  userId: number;
  categoryId: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTodoRequest {
  title: string;
  categoryId: number;
  description?: string;
  dueDate?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  categoryId?: number;
  description?: string | null;
  dueDate?: string | null;
}

export interface TodoFilter {
  categoryId?: number;
  isCompleted?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
}
