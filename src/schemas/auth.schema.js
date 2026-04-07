import { z } from 'zod';

const nameSchema = z.string().trim().min(1, 'Nome é obrigatório');
const emailSchema = z.string().trim().pipe(z.email('E-mail inválido'));
const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');
const requiredPasswordSchema = z.string().min(1, 'Senha é obrigatória');

export const registerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema
});

export const loginSchema = z.object({
    email: emailSchema,
    password: requiredPasswordSchema
});

export const updateProfileSchema = z.object({
    name: nameSchema,
    email: emailSchema
});

export const updatePasswordSchema = z.object({
    currentPassword: requiredPasswordSchema,
    newPassword: passwordSchema
});
