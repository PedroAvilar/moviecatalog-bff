import axios from 'axios';
import env from '../config/env.js';

const tmdb = axios.create({
    baseURL: 'https://api.themoviedb.org/3'
});

tmdb.interceptors.request.use((config) => {
    config.params = {
        ...config.params,
        api_key: env.tmdbApiKey,
        language: 'pt-BR'
    };
    return config;
});

export default tmdb;