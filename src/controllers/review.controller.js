import { createReviewService, deleteReviewService, getMyReviewsService, updateReviewService } from '../services/review.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/sendResponse.js';

export const createReview = asyncHandler(async (req, res) => {
    await createReviewService(req.user.id, req.body);

    return sendSuccess(
        res,
        {},
        'Avaliação criada com sucesso'
    );
});

export const getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await getMyReviewsService(req.user.id);

    res.json(reviews);
});

export const deleteReview = asyncHandler(async (req, res) => {
    await deleteReviewService(req.user.id, req.params.id)

    return sendSuccess(
        res,
        {},
        'Avaliação removida com sucesso'
    );
});

export const updateReview = asyncHandler(async (req, res) => {
    await updateReviewService(req.user.id, req.params.id, req.body);

    return sendSuccess(
        res,
        {},
        'Avaliação alterada com sucesso'
    );
});