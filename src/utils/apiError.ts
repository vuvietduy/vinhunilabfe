type ApiErrorResponse = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    } | string;
  };
};

export const isFormValidationError = (error: unknown) => {
  return typeof error === 'object' && error !== null && 'errorFields' in error;
};

export const getApiErrorMessage = (error: unknown, fallback = 'Có lỗi xảy ra') => {
  const apiError = error as ApiErrorResponse;
  const data = apiError.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  return data?.message || data?.error || fallback;
};
