import axios from 'axios';

export function isRequestCanceled(error: unknown): boolean {
  return axios.isCancel(error);
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 409) {
      return 'Unable to create account. Please check your information.';
    }

    return error.response?.data?.message || 'An error occurred';
  }

  return 'An error occurred';
}