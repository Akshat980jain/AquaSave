import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const me: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map