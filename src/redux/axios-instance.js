import axios from 'axios';

export const API_BASE_URL = '/api/quiva';

const PUBLIC_ENDPOINTS = new Set([
  '/comics/all',
  '/collections/all',
  '/auth/collaborators/all',
]);

const isLocalDevelopment = process.env.NODE_ENV === 'development';
const isPreviewRuntime =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'preview';

function shouldLogApiDiagnostics() {
  if (isLocalDevelopment || isPreviewRuntime) return true;

  if (typeof window === 'undefined') return false;

  return window.location.hostname.endsWith('.vercel.app');
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

function getRequestPath(configUrl) {
  const rawUrl = typeof configUrl === 'string' ? configUrl.trim() : '';

  if (!rawUrl) {
    return '';
  }

  try {
    const parsedUrl = rawUrl.startsWith('http')
      ? new URL(rawUrl)
      : new URL(rawUrl, 'http://quiva.local/api/quiva/');

    return parsedUrl.pathname
      .replace(/^\/api\/quiva(?=\/)/, '')
      .replace(/^\/api(?=\/)/, '');
  } catch (error) {
    return rawUrl.split('?')[0];
  }
}

function isPublicEndpoint(configUrl) {
  return PUBLIC_ENDPOINTS.has(getRequestPath(configUrl));
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken =
      typeof window !== 'undefined' ? window.localStorage.getItem('authToken') || '' : '';

    const isPublicRequest = isPublicEndpoint(config.url);

    if (accessToken && !isPublicRequest) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (isPublicRequest && config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Authorization');
      } else {
        delete config.headers.Authorization;
      }
    }

    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    error.quivaSafeMessage = 'Marketplace data could not be loaded. Please try again shortly.';

    if (shouldLogApiDiagnostics()) {
      console.warn('[Quiva API] Request failed.', {
        baseURL: API_BASE_URL,
        status: error?.response?.status,
        path: error?.config?.url,
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
