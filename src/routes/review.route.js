import express from 'express';
import { createReview, deleteReview, getMyReviews, updateReview } from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/me', protect, getMyReviews);
router.delete('/:id', protect, deleteReview);
router.put('/:id', protect, updateReview);

export default router;