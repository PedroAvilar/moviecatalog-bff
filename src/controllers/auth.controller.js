import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const secureProduction = process.env.NODE_ENV === 'production';
const sameSiteProduction = process.env.NODE_ENV === 'production' ? 'none' : 'strict';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({
            error: 'E-mail já cadastrado'
        });

        const user = await User.create({ name, email, password });
        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erro no registro: ', error);
        res.status(500).json({ error: 'Erro ao registrar usuário', details: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios'})
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'E-mail não cadastrado'})
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Senha inválida'})
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: sameSiteProduction,
            secure: secureProduction,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Login realizado com sucesso',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erro no login: ', error);
        res.status(500).json({ error: 'Erro ao realizar login' })
    }
};

export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: sameSiteProduction,
        secure: secureProduction
    });
    res.json({ message: 'Logout realizado com sucesso'});
};