import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import Review from '../models/review.model.js';

const secureProduction = process.env.NODE_ENV === 'production';
const sameSiteProduction = process.env.NODE_ENV === 'production' ? 'none' : 'strict';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios'})
        }

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

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();

        res.json({
            message: 'Perfil atualizado com sucesso',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ error: 'E-mail já está em uso' });
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(401).json({ error: 'Senha atual incorreta' });

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        await Review.deleteMany({ userId });
        await User.findByIdAndDelete(userId);

        res.clearCookie('token', {
            httpOnly: true,
            sameSite: sameSiteProduction,
            secure: secureProduction
        });

        res.json({ message: 'Conta e avaliações excluídas com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir conta:', error);
        res.status(500).json({ error: 'Erro ao excluir conta e dados associados' });
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