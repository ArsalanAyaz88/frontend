// src/lib/api.ts
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

const API_BASE_URL = ((import.meta as any).env.VITE_API_URL || '').replace(/\/$/, '');

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(options.headers);

  // Get the user session from localStorage to retrieve the auth token
  const userSessionString = localStorage.getItem('user');
  if (userSessionString) {
    const userSession = JSON.parse(userSessionString);
    // The access_token must be stored in the user session object upon login
    if (userSession && userSession.access_token) {
      headers.set('Authorization', `Bearer ${userSession.access_token}`);
    }
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, { ...options, headers });

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
