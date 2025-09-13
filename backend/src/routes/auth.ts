import { Router } from 'express';
import { login, me } from '../controllers/authController';
import { validateRequest, loginSchema } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticateToken, me);

export default router;