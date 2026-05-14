export interface Category {
  categoryId: number;
  name: string;
  isDefault: boolean;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}
