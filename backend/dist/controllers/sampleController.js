"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleController = void 0;
const sampleService_1 = require("../services/sampleService");
class SampleController {
    static async getAllSamples(req, res) {
        try {
            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                sortBy: req.query.sortBy || 'created_at',
                sortOrder: req.query.sortOrder || 'desc'
            };
            const filters = {
                status: req.query.status,
                location: req.query.location,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                hmpiMin: req.query.hmpiMin ? parseFloat(req.query.hmpiMin) : undefined,
                hmpiMax: req.query.hmpiMax ? parseFloat(req.query.hmpiMax) : undefined
            };
            const result = await sampleService_1.SampleService.findAll(filters, pagination, req.user?.role);
            return res.json({
                success: true,
                message: 'Samples retrieved successfully',
                data: {
                    samples: result.samples,
                    pagination: {
                        page: pagination.page,
                        limit: pagination.limit,
                        total: result.total,
                        totalPages: Math.ceil(result.total / pagination.limit)
                    }
                }
            });
        }
        catch (error) {
            console.error('Get samples error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getSampleById(req, res) {
        try {
            const { id } = req.params;
            const sample = await sampleService_1.SampleService.findById(id);
            if (!sample) {
                return res.status(404).json({
                    success: false,
                    message: 'Sample not found'
                });
            }
            return res.json({
                success: true,
                message: 'Sample retrieved successfully',
                data: sample
            });
        }
        catch (error) {
            console.error('Get sample error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async createSample(req, res) {
        try {
            const sampleData = req.body;
            const sample = await sampleService_1.SampleService.create(sampleData, req.user.id);
            return res.status(201).json({
                success: true,
                message: 'Sample created successfully',
                data: sample
            });
        }
        catch (error) {
            console.error('Create sample error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async updateSample(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const sample = await sampleService_1.SampleService.update(id, updateData);
            if (!sample) {
                return res.status(404).json({
                    success: false,
                    message: 'Sample not found'
                });
            }
            return res.json({
                success: true,
                message: 'Sample updated successfully',
                data: sample
            });
        }
        catch (error) {
            console.error('Update sample error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async deleteSample(req, res) {
        try {
            const { id } = req.params;
            const deleted = await sampleService_1.SampleService.delete(id);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Sample not found'
                });
            }
            return res.json({
                success: true,
                message: 'Sample deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete sample error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getStatistics(req, res) {
        try {
            const stats = await sampleService_1.SampleService.getStatistics(req.user?.role);
            return res.json({
                success: true,
                message: 'Statistics retrieved successfully',
                data: stats
            });
        }
        catch (error) {
            console.error('Get statistics error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.SampleController = SampleController;
//# sourceMappingURL=sampleController.js.map