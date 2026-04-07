import { protect } from '../middlewares/auth.middleware.js';
import { getFavorites, toggleFavorite } from '../controllers/favorite.controller.js';
import { toggleFavoriteSchema } from '../schemas/favorite.schema.js';
import validateRequest from '../middlewares/validateRequest.js';
import express from 'express';

const router = express.Router();

router.post('/toggle', protect, validateRequest(toggleFavoriteSchema), toggleFavorite);
router.get('/', protect, getFavorites);

export default router;