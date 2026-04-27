import connectDB from './config/db.js';
import env from './config/env.js';
import app from './app.js';

connectDB();

app.listen(env.port, () => {
    console.log(`Servidor BFF rodando em http://localhost:${env.port}`)
});