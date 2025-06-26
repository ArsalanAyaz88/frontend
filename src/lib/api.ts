// src/lib/api.ts
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(options.headers);
  const newOptions: RequestInit = { ...options, headers };

  // If an Authorization header is not provided, use cookie-based auth.
  if (!headers.has('Authorization')) {
    newOptions.credentials = 'include';
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, newOptions);

  if (response.status === 401) {
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
