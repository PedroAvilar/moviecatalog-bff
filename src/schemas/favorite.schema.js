import { z }  from 'zod';

export const toggleFavoriteSchema = z.object({
    movieId: z.coerce.string().min(1, 'ID do filme é obrigatório'),
    title: z.string().trim().min(1, 'Título é obrigatório'),
    poster_path: z.string().optional().nullable(),
    vote_average: z.coerce.number().default(0)
});