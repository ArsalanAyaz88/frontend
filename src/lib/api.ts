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

  // Do NOT set Authorization header from localStorage



  const fullUrl = `${API_BASE_URL}${url}`;

  // Always include credentials (cookies) for authentication
  const response = await fetch(fullUrl, { ...options, headers, credentials: 'include' });

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
