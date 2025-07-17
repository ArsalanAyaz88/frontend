// src/lib/api.ts
import axios, { AxiosRequestConfig } from 'axios';
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

export const axiosWithAuth = async (url: string, options: AxiosRequestConfig = {}): Promise<any> => {
  const headers = { ...options.headers };

  // Try to get admin token first, then fall back to user token
  let token: string | null = null;
  const adminToken = localStorage.getItem('admin_access_token');
  if (adminToken) {
    token = adminToken;
  } else {
    const userSessionString = localStorage.getItem('user');
    if (userSessionString) {
      try {
        const userSession: UserSession = JSON.parse(userSessionString);
        if (userSession && userSession.access_token) {
          token = userSession.access_token;
        }
      } catch (e) {
        console.error("Failed to parse user session from localStorage", e);
      }
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  try {
    const response = await axios({ ...options, url: fullUrl, headers });
    return response;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new UnauthorizedError();
    }
    throw error;
  }
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(options.headers);

  // Try to get admin token first, then fall back to user token
  let token: string | null = null;
  const adminToken = localStorage.getItem('admin_access_token');
  if (adminToken) {
    token = adminToken;
  } else {
    const userSessionString = localStorage.getItem('user');
    if (userSessionString) {
      try {
        const userSession: UserSession = JSON.parse(userSessionString);
        if (userSession && userSession.access_token) {
          token = userSession.access_token;
        }
      } catch (e) {
        console.error("Failed to parse user session from localStorage", e);
      }
    }
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, { ...options, headers });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  return response;
};

export const handleApiResponse = async <T>(res: Response): Promise<T> => {
    if (!res.ok) {
        let errorMessage = `HTTP error! status: ${res.status}`;
        try {
            // Assume error response has a standard shape
            const errorData: { message?: string, detail?: string } = await res.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
            // Response body is not JSON or is empty, use the status-based message.
        }
        throw new Error(errorMessage);
    }
    return res.json();
};
