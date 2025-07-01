// src/lib/api.ts
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

interface UserSession {
  access_token: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(options.headers);

  // Get the user session from localStorage to retrieve the auth token
  const userSessionString = localStorage.getItem('user');
  if (userSessionString) {
    const userSession: UserSession = JSON.parse(userSessionString);
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
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            // Assume error response has a standard shape
            const errorData: { message?: string, detail?: string } = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
            // Response body is not JSON or is empty, use the status-based message.
        }
        throw new Error(errorMessage);
    }
    return response.json();
};
