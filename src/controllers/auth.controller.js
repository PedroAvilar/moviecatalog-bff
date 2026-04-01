import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import Review from '../models/review.model.js';
import env from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

const cookieOptions = {
    httpOnly: true,
    sameSite: env.isProduction ? 'none' : 'strict',
    secure: env.isProduction,
    maxAge: 24 * 60 *60 * 1000
};

export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new AppError('Todos os campos são obrigatórios', 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new AppError('E-mail já cadastrado', 400);
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('E-mail e senha são obrigatórios', 400);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('E-mail ou senha inválidos', 401);
    }

    const token = jwt.sign(
        { id: user._id },
        env.jwtSecret,
        { expiresIn: '1d' }
    );

    res.cookie('token', token, cookieOptions);

    res.json({
        message: 'Login realizado com sucesso',
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        throw new AppError('Usuário não encontrado', 404);
    }

    if (!name || !email) {
        throw new AppError('Todos os campos são obrigatórios', 400);
    }

    user.name = name;
    user.email = email;

    try {
        await user.save();
    } catch (error) {
        if (error.code === 11000) {
            throw new AppError('E-mail já está em uso', 400);
        }
        throw error;
    }

    res.json({
        message: 'Perfil atualizado com sucesso',
        user: { 
            id: user._id,
            name: user.name,
            email: user.email 
        }
    });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        throw new AppError('Usuário não encontrado', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch){
        throw new AppError('Senha atual incorreta', 401);
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha atualizada com sucesso' });
});

export const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    await Review.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.clearCookie('token', cookieOptions);

    res.json({ message: 'Conta e avaliações excluídas com sucesso' });
});

export const logout = (req, res) => {
    res.clearCookie('token', cookieOptions);

    res.json({ message: 'Logout realizado com sucesso'});
};