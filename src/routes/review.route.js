import { createReview, deleteReview, getMyReviews, updateReview } from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { createReviewSchema, updateReviewSchema } from '../schemas/review.schema.js';
import express from 'express';
import validateRequest from '../middlewares/validateRequest.js';
import sanitizeInput from '../middlewares/sanitizeInput.js';

const router = express.Router();

router.post('/', protect, sanitizeInput, validateRequest(createReviewSchema), createReview);
router.get('/me', protect, getMyReviews);
router.delete('/:id', protect, deleteReview);
router.put('/:id', protect, sanitizeInput, validateRequest(updateReviewSchema), updateReview);

export default router;