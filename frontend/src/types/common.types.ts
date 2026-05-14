export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}
