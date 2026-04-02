import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new AppError('Não autorizado, token não encontrado', 401);
    }

    let decoded;

    try {
        decoded = jwt.verify(token, env.jwtSecret);
    } catch {
        throw new AppError('Não autorizado, token inválido', 401);
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
        throw new AppError('Não autorizado', 401);
    }

    req.user = user;

    next();
});