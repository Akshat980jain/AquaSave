import { Router } from 'express';
import { SampleController } from '../controllers/sampleController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest, createSampleSchema, updateSampleSchema } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all samples (with filtering and pagination)
router.get('/', SampleController.getAllSamples);

// Get sample statistics
router.get('/statistics', SampleController.getStatistics);

// Get specific sample
router.get('/:id', SampleController.getSampleById);

// Create new sample (higher officials only)
router.post('/', 
  requireRole(['higher_official']), 
  validateRequest(createSampleSchema), 
  SampleController.createSample
);

// Update sample (higher officials only)
router.put('/:id', 
  requireRole(['higher_official']), 
  validateRequest(updateSampleSchema), 
  SampleController.updateSample
);

// Delete sample (higher officials only)
router.delete('/:id', 
  requireRole(['higher_official']), 
  SampleController.deleteSample
);

export default router;