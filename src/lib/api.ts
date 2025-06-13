// src/lib/api.ts
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('accessToken');
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // When uploading a file with FormData, the browser automatically sets the
  // Content-Type to 'multipart/form-data' with the correct boundary.
  // Manually setting it, even to the same value, can cause issues.
  // Here, we ensure that if the body is FormData, we don't send a Content-Type header.
  if (options.body instanceof FormData) {
    headers.delete('Content-Type');
  } else if (!headers.has('Content-Type')) {
    // Set default Content-Type for non-FormData requests if not already set
    headers.set('Content-Type', 'application/json');
  }

  const fullUrl = `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, { ...options, headers });

  if (response.status === 401) {
    // Clear session and throw a specific error for the UI to handle.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    throw new UnauthorizedError();
  }

  return response;
};

export const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `An unknown error occurred`);
    }
    return response.json();
};
