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
                minHmpi: req.query.minHmpi ? parseFloat(req.query.minHmpi) : undefined,
                maxHmpi: req.query.maxHmpi ? parseFloat(req.query.maxHmpi) : undefined
            };
            const result = await sampleService_1.SampleService.findAll(filters, pagination, req.user?.role);
            return res.json({
                success: true,
                message: 'Samples retrieved successfully',
                data: result
            });
        }
        catch (error) {
            console.error('Get samples error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
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
                data: { sample }
            });
        }
        catch (error) {
            console.error('Get sample by ID error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async createSample(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const sample = await sampleService_1.SampleService.create(req.body, req.user._id.toString());
            return res.status(201).json({
                success: true,
                message: 'Sample created successfully',
                data: { sample }
            });
        }
        catch (error) {
            console.error('Create sample error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async updateSample(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const { id } = req.params;
            const sample = await sampleService_1.SampleService.update(id, req.body, req.user._id.toString());
            if (!sample) {
                return res.status(404).json({
                    success: false,
                    message: 'Sample not found'
                });
            }
            return res.json({
                success: true,
                message: 'Sample updated successfully',
                data: { sample }
            });
        }
        catch (error) {
            console.error('Update sample error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async deleteSample(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
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
                message: 'Internal server error'
            });
        }
    }
    static async getStatistics(req, res) {
        try {
            const stats = await sampleService_1.SampleService.getStatistics(req.user?.role);
            return res.json({
                success: true,
                message: 'Statistics retrieved successfully',
                data: { statistics: stats }
            });
        }
        catch (error) {
            console.error('Get statistics error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
exports.SampleController = SampleController;
//# sourceMappingURL=sampleController.js.map