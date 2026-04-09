import { registerUser, loginUser, updateUserProfile, updateUserPassword, deleteUserAccount } from '../services/auth.service.js';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';

const mapUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email
})

const cookieOptions = {
    httpOnly: true,
    sameSite: env.isProduction ? 'none' : 'strict',
    secure: env.isProduction,
    maxAge: 24 * 60 * 60 * 1000
};

export const register = asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: mapUser(user)
    });
});

export const login = asyncHandler(async (req, res) => {
    const user = await loginUser(req.body);

    const token = jwt.sign(
        { id: user._id },
        env.jwtSecret,
        { expiresIn: '1d' }
    );

    res.cookie('token', token, cookieOptions);

    res.json({
        message: 'Login realizado com sucesso',
        user: mapUser(user)
    });
});

export const getMe = (req, res) => {
    res.json({
        user: mapUser(req.user)
    });
};

export const updateProfile = asyncHandler(async (req, res) => {
    const user = await updateUserProfile(req.user.id, req.body);

    res.json({
        message: 'Perfil atualizado com sucesso',
        user: mapUser(user)
    });
});

export const updatePassword = asyncHandler(async (req, res) => {
    await updateUserPassword(req.user.id, req.body);

    res.json({ message: 'Senha atualizada com sucesso' });
});

export const deleteAccount = asyncHandler(async (req, res) => {
    await deleteUserAccount(req.user.id);

    res.clearCookie('token', cookieOptions);

    res.json({ message: 'Conta e avaliações excluídas com sucesso' });
});

export const logout = (req, res) => {
    res.clearCookie('token', cookieOptions);

    res.json({ message: 'Logout realizado com sucesso'});
};