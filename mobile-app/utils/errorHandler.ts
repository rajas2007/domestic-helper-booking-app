export const getErrorMessage = (error: any): string => {
  // Network errors (no internet, timeout, etc.)
  if (!error?.response) {
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network request failed')) {
      return 'Check your internet connection';
    }
    if (error?.code === 'TIMEOUT') {
      return 'Request timed out. Please try again';
    }
    return 'Network error. Please check your connection';
  }

  // Server errors
  const status = error.response.status;
  const data = error.response.data;

  // Server sleeping (Render free tier)
  if (status === 503 || status === 504 || data?.message?.includes('sleeping')) {
    return 'Server is waking up, please wait...';
  }

  // Authentication errors
  if (status === 401) {
    return 'Session expired. Please login again';
  }

  // Forbidden
  if (status === 403) {
    return 'Access denied';
  }

  // Not found
  if (status === 404) {
    return 'Resource not found';
  }

  // Server errors
  if (status >= 500) {
    return 'Server error. Please try again later';
  }

  // Client errors with custom message
  if (data?.message) {
    return data.message;
  }

  // Default error
  return 'Something went wrong. Please try again';
};