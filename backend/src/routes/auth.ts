import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest, loginSchema } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticateToken, AuthController.me);

export default router;