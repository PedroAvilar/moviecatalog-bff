import express from 'express';
import { protect } from '../middlewares/auth.middlewares.js';
import { getFavorites, toggleFavorite } from '../controllers/favorite.controller.js';

const router = express.Router();

router.post('/toggle', protect, toggleFavorite);
router.get('/', protect, getFavorites);

export default router;