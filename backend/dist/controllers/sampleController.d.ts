import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class SampleController {
    static getAllSamples(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getSampleById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static createSample(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateSample(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteSample(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getStatistics(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=sampleController.d.ts.map