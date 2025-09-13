import { Response } from 'express';
import { SampleService } from '../services/sampleService';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, PaginationQuery, SampleFilters } from '../types';

export class SampleController {
  static async getAllSamples(req: AuthRequest, res: Response) {
    try {
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string || 'created_at',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const filters: SampleFilters = {
        status: req.query.status as any,
        location: req.query.location as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        hmpiMin: req.query.hmpiMin ? parseFloat(req.query.hmpiMin as string) : undefined,
        hmpiMax: req.query.hmpiMax ? parseFloat(req.query.hmpiMax as string) : undefined
      };

      const result = await SampleService.findAll(filters, pagination, req.user?.role);

      return res.json({
        success: true,
        message: 'Samples retrieved successfully',
        data: {
          samples: result.samples,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / pagination.limit!)
          }
        }
      } as ApiResponse);

    } catch (error) {
      console.error('Get samples error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  static async getSampleById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const sample = await SampleService.findById(id);

      if (!sample) {
        return res.status(404).json({
          success: false,
          message: 'Sample not found'
        } as ApiResponse);
      }

      return res.json({
        success: true,
        message: 'Sample retrieved successfully',
        data: sample
      } as ApiResponse);

    } catch (error) {
      console.error('Get sample error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  static async createSample(req: AuthRequest, res: Response) {
    try {
      const sampleData = req.body;
      const sample = await SampleService.create(sampleData, req.user!.id);

      return res.status(201).json({
        success: true,
        message: 'Sample created successfully',
        data: sample
      } as ApiResponse);

    } catch (error) {
      console.error('Create sample error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  static async updateSample(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const sample = await SampleService.update(id, updateData);

      if (!sample) {
        return res.status(404).json({
          success: false,
          message: 'Sample not found'
        } as ApiResponse);
      }

      return res.json({
        success: true,
        message: 'Sample updated successfully',
        data: sample
      } as ApiResponse);

    } catch (error) {
      console.error('Update sample error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  static async deleteSample(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await SampleService.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Sample not found'
        } as ApiResponse);
      }

      return res.json({
        success: true,
        message: 'Sample deleted successfully'
      } as ApiResponse);

    } catch (error) {
      console.error('Delete sample error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  static async getStatistics(req: AuthRequest, res: Response) {
    try {
      const stats = await SampleService.getStatistics(req.user?.role);

      return res.json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: stats
      } as ApiResponse);

    } catch (error) {
      console.error('Get statistics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }
}