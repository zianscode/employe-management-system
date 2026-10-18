export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
};

export const ApiResponse = {
  success: <T>(message: string, data?: T): ApiResponse<T> => ({
    success: true,
    message,
    data,
  }),

  error: (message: string, errors?: any): ApiResponse => ({
    success: false,
    message,
    errors,
  }),
};
