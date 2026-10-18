export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

export const ApiResponse = {
  success: <T>(message: string, data?: T): ApiResponse<T> => ({
    success: true,
    message,
    data,
  }),

  error: <T = never>(message: string): ApiResponse<T> => ({
    success: false,
    message,
  }),

  /** Ubah error apa pun menjadi respons gagal dengan pesan yang bisa ditampilkan */
  fromError: <T = never>(error: unknown, fallback: string): ApiResponse<T> => ({
    success: false,
    message: error instanceof Error && error.message ? error.message : fallback,
  }),
};
