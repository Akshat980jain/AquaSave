import { Router } from 'express';
import authRoutes from './auth';
import sampleRoutes from './samples';

const router = Router();

router.use('/auth', authRoutes);
router.use('/samples', sampleRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AquaSafe API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;