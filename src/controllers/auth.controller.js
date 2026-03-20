import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

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