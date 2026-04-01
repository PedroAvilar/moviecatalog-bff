import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import env from '../config/env.js';

export const protect = async (req, res, next) => {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Não autorizado, token não encontrado' });
    }

    try {
        const decoded = jwt.verify(token, env.jwtSecret);

        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não encontrado'});
        }

        next();
        
    } catch (error) {
        console.error('Erro no middleware de auth: ', error);
        res.status(401).json({ error: 'Não autorizado, token inválido'});
    }
};