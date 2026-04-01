import dotenv from 'dotenv';

dotenv.config();

const requiredEnvs = [
    'PORT',
    'TMDB_API_KEY',
    'JWT_SECRET',
    'MONGO_URI',
    'NODE_ENV',
];

requiredEnvs.forEach((env) => {
    if (!process.env[env]) {
        console.error(`Erro: Variável de ambiente ausente: ${env}`);
        process.exit(1);
    }
});

const env = {
    port: process.env.PORT,
    tmdbApiKey: process.env.TMDB_API_KEY,
    jwtSecret: process.env.JWT_SECRET,
    mongoUri: process.env.MONGO_URI,
    nodeEnv: process.env.NODE_ENV,

    isProduction: process.env.NODE_ENV === 'production',

    corsOrigins: process.env.NODE_ENV === 'production'
    ? ['https://pedroavilar.github.io']
    : ['http://localhost:5173']
};

export default env;