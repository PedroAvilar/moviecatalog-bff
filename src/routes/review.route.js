import express from 'express';
import { createReview, deleteReview, getMyReviews } from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/me', protect, getMyReviews);
router.delete('/:id', protect, deleteReview)

export default router;