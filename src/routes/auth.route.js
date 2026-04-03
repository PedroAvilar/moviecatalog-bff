import express from 'express';
import { deleteAccount, getMe, login, logout, register, updatePassword, updateProfile } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.delete('/delete-account', protect, deleteAccount);

export default router;