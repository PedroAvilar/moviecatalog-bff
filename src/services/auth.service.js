import User from '../models/user.model.js';
import Review from '../models/review.model.js';
import AppError from '../utils/AppError.js';

export const registerUser = async ({ name, email, password }) => {
    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new AppError('E-mail já cadastrado', 400);
    }

    const user = await User.create({ name, email, password });

    return user;
}

export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('E-mail ou senha incorretos', 401);
    }

    return user;
}

export const updateUserProfile = async (userId, { name, email }) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('Usuário não encontrado', 404);
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

    return user;
};

export const updateUserPassword = async (userId, { currentPassword, newPassword }) => {
    const user = await User.findById(userId).select('+password');

    if (!user) {
        throw new AppError('Usuário não encontrado', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch){
        throw new AppError('Senha atual incorreta', 400);
    }

    user.password = newPassword;
    await user.save();
};

export const deleteUserAccount = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('Usuário não encontrado', 404);
    }

    await Review.deleteMany({ userId });
    await User.findByIdAndDelete(userId);
};