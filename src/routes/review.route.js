import express from 'express';
import { createReview, getMyReviews } from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/me', protect, getMyReviews);

export default router;