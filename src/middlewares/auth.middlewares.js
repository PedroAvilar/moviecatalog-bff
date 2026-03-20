import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
    let token;
    token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Não autorizado, token não encontrado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

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