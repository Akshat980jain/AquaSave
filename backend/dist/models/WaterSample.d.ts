import mongoose, { Document } from 'mongoose';
export interface IWaterSample extends Document {
    location: string;
    latitude: number;
    longitude: number;
    sample_date: Date;
    collected_by: string;
    cu_concentration: number;
    pb_concentration: number;
    cd_concentration: number;
    zn_concentration: number;
    hmpi_value: number;
    status: 'safe' | 'marginal' | 'high';
    notes?: string;
    additional_data?: {
        pH?: number;
        ec?: number;
        co3?: number;
        hco3?: number;
        cl?: number;
        f?: number;
        so4?: number;
        no3?: number;
        po4?: number;
        totalHardness?: number;
        ca?: number;
        mg?: number;
        na?: number;
        k?: number;
        fe?: number;
        as?: number;
        u?: number;
    };
    created_at: Date;
    updated_at: Date;
}
export declare const WaterSample: mongoose.Model<IWaterSample, {}, {}, {}, mongoose.Document<unknown, {}, IWaterSample, {}, {}> & IWaterSample & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=WaterSample.d.ts.map