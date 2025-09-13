import { IWaterSample } from '../models/WaterSample';
import { PaginationQuery, SampleFilters } from '../types';
export declare class SampleService {
    static calculateHMPI(cu: number, pb: number, cd: number, zn: number): number;
    static determineStatus(hmpi: number): 'safe' | 'marginal' | 'high';
    static findAll(filters?: SampleFilters, pagination?: PaginationQuery, userRole?: string): Promise<{
        samples: IWaterSample[];
        total: number;
    }>;
    static findById(id: string): Promise<IWaterSample | null>;
    static create(sampleData: Partial<IWaterSample>, userId: string): Promise<IWaterSample>;
    static update(id: string, updateData: Partial<IWaterSample>): Promise<IWaterSample | null>;
    static delete(id: string): Promise<boolean>;
    static getStatistics(userRole?: string): Promise<any>;
}
//# sourceMappingURL=sampleService.d.ts.map