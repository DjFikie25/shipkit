/** Shared API response envelope. */
export interface ApiResponse<T> {
  data: T;
  error?: never;
}
export interface ApiError {
  data?: never;
  error: { message: string; code?: string };
}
export type ApiResult<T> = ApiResponse<T> | ApiError;

/** Chat message as returned by /api/chat. */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
}
