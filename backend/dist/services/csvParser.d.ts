export interface CSVWaterSample {
    sNo: number;
    state: string;
    district: string;
    location: string;
    longitude: number;
    latitude: number;
    year: number;
    pH: number;
    ec: number;
    co3: number;
    hco3: number;
    cl: number;
    f: number;
    so4: number;
    no3: number;
    po4: number;
    totalHardness: number;
    ca: number;
    mg: number;
    na: number;
    k: number;
    fe: number;
    as: number;
    u: number;
}
export declare class CSVParser {
    static parseCSVData(csvPath: string): CSVWaterSample[];
    private static parseCSVLine;
    static convertToWaterSample(csvSample: CSVWaterSample, collectedBy: string): any;
}
//# sourceMappingURL=csvParser.d.ts.map