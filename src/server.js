import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'BFF rodando corretamente'
    })
})

app.use((req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada'
    })
})

app.listen(PORT, () => {
    console.log(`Servidor BFF rodando em http://localhost:${PORT}`)
})