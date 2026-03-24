import express from 'express';
import { login, logout, register } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, (req, res) => {
    res.json(req.user);
});

export default router;