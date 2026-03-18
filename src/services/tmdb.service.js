import axios from "axios";
import dotenv from 'dotenv';

dotenv.config()

const tmdb = axios.create({
    baseURL: 'https://api.themoviedb.org/3'
});

tmdb.interceptors.request.use((config) => {
    config.params = {
        ...config.params,
        api_key: process.env.TMDB_API_KEY,
        language: 'pt-BR'
    };
    return config;
});

export default tmdb;