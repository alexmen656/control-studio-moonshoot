import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://localhost:6709/api',
    headers: { 'Content-Type': 'application/json' }
});

const AUTH_TOKEN = localStorage.getItem('auth_token') || '';
instance.defaults.headers.common['Authorization'] = AUTH_TOKEN;

export default instance;