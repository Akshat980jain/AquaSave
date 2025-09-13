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
        minHmpi: req.query.minHmpi ? parseFloat(req.query.minHmpi as string) : undefined,
        maxHmpi: req.query.maxHmpi ? parseFloat(req.query.maxHmpi as string) : undefined
      };

      const result = await SampleService.findAll(filters, pagination, req.user?.role);

      return res.json({
        success: true,
        message: 'Samples retrieved successfully',
        data: result
      } as ApiResponse);

    } catch (error) {
      console.error('Get samples error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
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
        data: { sample }
      } as ApiResponse);

    } catch (error) {
      console.error('Get sample by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async createSample(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
      }

      const sample = await SampleService.create(req.body, (req.user as any)._id.toString());

      return res.status(201).json({
        success: true,
        message: 'Sample created successfully',
        data: { sample }
      } as ApiResponse);

    } catch (error) {
      console.error('Create sample error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async updateSample(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
      }

      const { id } = req.params;
      const sample = await SampleService.update(id, req.body, (req.user as any)._id.toString());

      if (!sample) {
        return res.status(404).json({
          success: false,
          message: 'Sample not found'
        } as ApiResponse);
      }

      return res.json({
        success: true,
        message: 'Sample updated successfully',
        data: { sample }
      } as ApiResponse);

    } catch (error) {
      console.error('Update sample error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async deleteSample(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
      }

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
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getStatistics(req: AuthRequest, res: Response) {
    try {
      const stats = await SampleService.getStatistics(req.user?.role);

      return res.json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: { statistics: stats }
      } as ApiResponse);

    } catch (error) {
      console.error('Get statistics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}