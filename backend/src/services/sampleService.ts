import { WaterSample, IWaterSample } from '../models/WaterSample';
import { PaginationQuery, SampleFilters } from '../types';

export class SampleService {
  static calculateHMPI(cu: number, pb: number, cd: number, zn: number): number {
    // Simplified HMPI calculation
    // In real implementation, this would use proper WHO/EPA standards
    const cuWeight = 10;
    const pbWeight = 100;
    const cdWeight = 1000;
    const znWeight = 5;
    
    return (cu * cuWeight) + (pb * pbWeight) + (cd * cdWeight) + (zn * znWeight);
  }

  static determineStatus(hmpi: number): 'safe' | 'marginal' | 'high' {
    if (hmpi < 50) return 'safe';
    if (hmpi < 100) return 'marginal';
    return 'high';
  }

  static async findAll(
    filters: SampleFilters = {},
    pagination: PaginationQuery = {},
    userRole?: string
  ): Promise<{ samples: IWaterSample[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    // Build MongoDB query
    const query: any = {};

    // Apply filters
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

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Apply limit for lower officials
    const actualLimit = userRole === 'lower_official' ? Math.min(limit, 10) : limit;

    try {
      const [samples, total] = await Promise.all([
        WaterSample.find(query)
          .sort(sort)
          .skip(offset)
          .limit(actualLimit)
          .populate('collected_by', 'name username')
          .lean(),
        WaterSample.countDocuments(query)
      ]);

      return { samples, total };
    } catch (error) {
      throw error;
    }
  }

  static async findById(id: string): Promise<IWaterSample | null> {
    return await WaterSample.findById(id).populate('collected_by', 'name username');
  }

  static async create(sampleData: Partial<IWaterSample>, userId: string): Promise<IWaterSample> {
    const hmpi = this.calculateHMPI(
      sampleData.cu_concentration!,
      sampleData.pb_concentration!,
      sampleData.cd_concentration!,
      sampleData.zn_concentration!
    );
    const status = this.determineStatus(hmpi);

    const sample = new WaterSample({
      ...sampleData,
      hmpi_value: hmpi,
      status,
      collected_by: userId
    });

    return await sample.save();
  }

  static async update(id: string, updateData: Partial<IWaterSample>): Promise<IWaterSample | null> {
    const existing = await WaterSample.findById(id);
    if (!existing) return null;

    // Recalculate HMPI if metal concentrations are updated
    let hmpi = existing.hmpi_value;
    let status = existing.status;

    if (updateData.cu_concentration !== undefined ||
        updateData.pb_concentration !== undefined ||
        updateData.cd_concentration !== undefined ||
        updateData.zn_concentration !== undefined) {
      
      hmpi = this.calculateHMPI(
        updateData.cu_concentration ?? existing.cu_concentration,
        updateData.pb_concentration ?? existing.pb_concentration,
        updateData.cd_concentration ?? existing.cd_concentration,
        updateData.zn_concentration ?? existing.zn_concentration
      );
      status = this.determineStatus(hmpi);
    }

    const updatedSample = await WaterSample.findByIdAndUpdate(
      id,
      {
        ...updateData,
        hmpi_value: hmpi,
        status
      },
      { new: true }
    ).populate('collected_by', 'name username');

    return updatedSample;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await WaterSample.findByIdAndDelete(id);
    return !!result;
  }

  static async getStatistics(userRole?: string): Promise<any> {
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

    // Apply limit for lower officials
    if (userRole === 'lower_official') {
      pipeline.unshift({ $limit: 10 } as any);
    }

    const result = await WaterSample.aggregate(pipeline);
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