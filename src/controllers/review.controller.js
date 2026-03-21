import Review from '../models/review.model.js';

export const createReview = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;
        const userId = req.user.id;

        if (!movieId || !rating || !userId || !comment) {
            return res.status(400).json({ error: 'Avaliação inválida'})
        }

        const review = await Review.create({
            movieId,
            userId,
            rating,
            comment
        });

        res.status(201).json(review);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Você já avaliou esse filme' });
        }
        console.error('Erro ao salvar avaliação: ', error);
        res.status(500).json({ error: 'Erro ao salvar avaliação' });
    }
};

export const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user.id }).sort('-createdAt');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar suas avaliações'})
    }
};