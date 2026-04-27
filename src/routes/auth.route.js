import { deleteAccount, getMe, login, logout, register, updatePassword, updateProfile } from '../controllers/auth.controller.js';
import { loginSchema, registerSchema, updatePasswordSchema, updateProfileSchema } from '../schemas/auth.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import express from 'express';
import validateRequest from '../middlewares/validateRequest.js';
import sanitizeInput from '../middlewares/sanitizeInput.js';

const router = express.Router();

router.post('/register', sanitizeInput, validateRequest(registerSchema), register);
router.post('/login', sanitizeInput, validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, sanitizeInput, validateRequest(updateProfileSchema), updateProfile);
router.put('/update-password', protect, validateRequest(updatePasswordSchema), updatePassword);
router.delete('/delete-account', protect, deleteAccount);

export default router;