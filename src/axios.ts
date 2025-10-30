import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const isProd = import.meta.env.MODE === 'production';

const instance = axios.create({
  baseURL: isProd ? 'https://api.reelmia.com/api' : 'http://localhost:6709/api'
});


instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;