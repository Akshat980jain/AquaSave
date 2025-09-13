"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleService = void 0;
const WaterSample_1 = require("../models/WaterSample");
class SampleService {
    static calculateHMPI(cu, pb, cd, zn) {
        const cuWeight = 10;
        const pbWeight = 100;
        const cdWeight = 1000;
        const znWeight = 5;
        return (cu * cuWeight) + (pb * pbWeight) + (cd * cdWeight) + (zn * znWeight);
    }
    static determineStatus(hmpi) {
        if (hmpi < 50)
            return 'safe';
        if (hmpi < 100)
            return 'marginal';
        return 'high';
    }
    static async findAll(filters = {}, pagination = {}, userRole) {
        const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
        const offset = (page - 1) * limit;
        const query = {};
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.location) {
            query.location = { $regex: filters.location, $options: 'i' };
        }
        if (filters.dateFrom || filters.dateTo) {
            query.sample_date = {};
            if (filters.dateFrom) {
                query.sample_date.$gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                query.sample_date.$lte = new Date(filters.dateTo);
            }
        }
        if (filters.hmpiMin !== undefined || filters.hmpiMax !== undefined) {
            query.hmpi_value = {};
            if (filters.hmpiMin !== undefined) {
                query.hmpi_value.$gte = filters.hmpiMin;
            }
            if (filters.hmpiMax !== undefined) {
                query.hmpi_value.$lte = filters.hmpiMax;
            }
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const actualLimit = userRole === 'lower_official' ? Math.min(limit, 10) : limit;
        try {
            const [samples, total] = await Promise.all([
                WaterSample_1.WaterSample.find(query)
                    .sort(sort)
                    .skip(offset)
                    .limit(actualLimit)
                    .populate('collected_by', 'name username')
                    .lean(),
                WaterSample_1.WaterSample.countDocuments(query)
            ]);
            return { samples, total };
        }
        catch (error) {
            throw error;
        }
    }
    static async findById(id) {
        return await WaterSample_1.WaterSample.findById(id).populate('collected_by', 'name username');
    }
    static async create(sampleData, userId) {
        const hmpi = this.calculateHMPI(sampleData.cu_concentration, sampleData.pb_concentration, sampleData.cd_concentration, sampleData.zn_concentration);
        const status = this.determineStatus(hmpi);
        const sample = new WaterSample_1.WaterSample({
            ...sampleData,
            hmpi_value: hmpi,
            status,
            collected_by: userId
        });
        return await sample.save();
    }
    static async update(id, updateData) {
        const existing = await WaterSample_1.WaterSample.findById(id);
        if (!existing)
            return null;
        let hmpi = existing.hmpi_value;
        let status = existing.status;
        if (updateData.cu_concentration !== undefined ||
            updateData.pb_concentration !== undefined ||
            updateData.cd_concentration !== undefined ||
            updateData.zn_concentration !== undefined) {
            hmpi = this.calculateHMPI(updateData.cu_concentration ?? existing.cu_concentration, updateData.pb_concentration ?? existing.pb_concentration, updateData.cd_concentration ?? existing.cd_concentration, updateData.zn_concentration ?? existing.zn_concentration);
            status = this.determineStatus(hmpi);
        }
        const updatedSample = await WaterSample_1.WaterSample.findByIdAndUpdate(id, {
            ...updateData,
            hmpi_value: hmpi,
            status
        }, { new: true }).populate('collected_by', 'name username');
        return updatedSample;
    }
    static async delete(id) {
        const result = await WaterSample_1.WaterSample.findByIdAndDelete(id);
        return !!result;
    }
    static async getStatistics(userRole) {
        const pipeline = [
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    safe: { $sum: { $cond: [{ $eq: ['$status', 'safe'] }, 1, 0] } },
                    marginal: { $sum: { $cond: [{ $eq: ['$status', 'marginal'] }, 1, 0] } },
                    high: { $sum: { $cond: [{ $eq: ['$status', 'high'] }, 1, 0] } },
                    avg_hmpi: { $avg: '$hmpi_value' },
                    avg_cu: { $avg: '$cu_concentration' },
                    avg_pb: { $avg: '$pb_concentration' },
                    avg_cd: { $avg: '$cd_concentration' },
                    avg_zn: { $avg: '$zn_concentration' }
                }
            }
        ];
        if (userRole === 'lower_official') {
            pipeline.unshift({ $limit: 10 });
        }
        const result = await WaterSample_1.WaterSample.aggregate(pipeline);
        return result[0] || {
            total: 0,
            safe: 0,
            marginal: 0,
            high: 0,
            avg_hmpi: 0,
            avg_cu: 0,
            avg_pb: 0,
            avg_cd: 0,
            avg_zn: 0
        };
    }
}
exports.SampleService = SampleService;
//# sourceMappingURL=sampleService.js.map