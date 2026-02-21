export type ApiError = {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> = {
  ok: boolean;
  data: T;
};
