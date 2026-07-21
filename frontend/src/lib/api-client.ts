import axios from 'axios';

let accessTokenCache: string | null = null;
let activeRefreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessTokenCache = token;
};

export const getAccessToken = () => accessTokenCache;

export const getRefreshToken = async (): Promise<string | null> => {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = axios
    .post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
      {},
      { withCredentials: true }
    )
    .then((res) => {
      const token = res.data?.data?.accessToken || null;
      activeRefreshPromise = null;
      return token;
    })
    .catch((err) => {
      activeRefreshPromise = null;
      throw err;
    });

  return activeRefreshPromise;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send HttpOnly refresh cookies automatically
});

// Request Interceptor: Attach bearer token
api.interceptors.request.use(
  (config) => {
    if (accessTokenCache && config.headers) {
      config.headers.Authorization = `Bearer ${accessTokenCache}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token expiration refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loop if refresh request itself returns 401
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      
      try {
        const newAccessToken = await getRefreshToken();
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        setAccessToken(null);
        
        // Force redirect to login page if window is defined
        if (typeof window !== 'undefined') {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
