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
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;
      const actualLimit = userRole === 'lower_official' ? Math.min(limit, 10) : limit;

      // Build query
      const query: any = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.location) {
        query.location = { $regex: filters.location, $options: 'i' };
      }
      
      if (filters.minHmpi !== undefined || filters.maxHmpi !== undefined) {
        query.hmpi_value = {};
        if (filters.minHmpi !== undefined) {
          query.hmpi_value.$gte = filters.minHmpi;
        }
        if (filters.maxHmpi !== undefined) {
          query.hmpi_value.$lte = filters.maxHmpi;
        }
      }

      // Build sort
      const sort: any = {};
      if (filters.sortBy) {
        sort[filters.sortBy] = filters.sortOrder === 'desc' ? -1 : 1;
      } else {
        sort.created_at = -1; // Default sort by creation date
      }

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
    try {
      return await WaterSample.findById(id).populate('collected_by', 'name username');
    } catch (error) {
      throw error;
    }
  }

  static async create(sampleData: any, userId: string): Promise<IWaterSample> {
    try {
      const hmpi = this.calculateHMPI(
        sampleData.cu_concentration,
        sampleData.pb_concentration,
        sampleData.cd_concentration,
        sampleData.zn_concentration
      );

      const status = this.determineStatus(hmpi);

      const sample = new WaterSample({
        ...sampleData,
        hmpi_value: hmpi,
        status,
        collected_by: userId
      });

      return await sample.save();
    } catch (error) {
      throw error;
    }
  }

  static async update(id: string, updateData: any, userId: string): Promise<IWaterSample | null> {
    try {
      // Recalculate HMPI if metal concentrations are being updated
      if (updateData.cu_concentration || updateData.pb_concentration || 
          updateData.cd_concentration || updateData.zn_concentration) {
        
        const existingSample = await WaterSample.findById(id);
        if (!existingSample) {
          return null;
        }

        const cu = updateData.cu_concentration ?? existingSample.cu_concentration;
        const pb = updateData.pb_concentration ?? existingSample.pb_concentration;
        const cd = updateData.cd_concentration ?? existingSample.cd_concentration;
        const zn = updateData.zn_concentration ?? existingSample.zn_concentration;

        const hmpi = this.calculateHMPI(cu, pb, cd, zn);
        const status = this.determineStatus(hmpi);

        updateData.hmpi_value = hmpi;
        updateData.status = status;
      }

      return await WaterSample.findByIdAndUpdate(
        id,
        { ...updateData, updated_at: new Date() },
        { new: true }
      ).populate('collected_by', 'name username');
    } catch (error) {
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await WaterSample.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics(userRole?: string): Promise<any> {
    try {
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

      // Limit results for lower officials
      if (userRole === 'lower_official') {
        pipeline.unshift({ $limit: 10 } as any);
      }

      const result = await WaterSample.aggregate(pipeline);
      
      if (result.length === 0) {
        return {
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

      return result[0];
    } catch (error) {
      throw error;
    }
  }
}