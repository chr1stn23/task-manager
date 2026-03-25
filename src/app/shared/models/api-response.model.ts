export interface ErrorResponse {
  message: string;
  code: string;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  timestamp: string; // ISO string format
  data: T | null;
  error?: ErrorResponse;
}
