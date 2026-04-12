import { z } from 'zod';

const movieIdSchema = z.coerce.number().min(1, 'ID do filme é obrigatório');
const ratingSchema = z.coerce.number({ required_error: 'Nota é obrigatória' }).min(0, 'Nota mínima é 0').max(10, 'Nota máxima é 10');
const commentSchema = z.string().trim().min(3, 'Comentário deve ter no mínimo 3 caracteres').max(500, 'Comentário deve ter no máximo 500 caracteres');

export const createReviewSchema = z.object({
    movieId: movieIdSchema,
    rating: ratingSchema,
    comment: commentSchema
});

export const updateReviewSchema = z.object({
    rating: ratingSchema,
    comment: commentSchema
});