"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSVParser = void 0;
const fs_1 = __importDefault(require("fs"));
class CSVParser {
    static parseCSVData(csvPath) {
        try {
            const csvContent = fs_1.default.readFileSync(csvPath, 'utf-8');
            const lines = csvContent.split('\n');
            const headers = lines[0].split(',');
            const samples = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line)
                    continue;
                const values = this.parseCSVLine(line);
                if (values.length < headers.length)
                    continue;
                try {
                    const sample = {
                        sNo: parseInt(values[0]) || 0,
                        state: values[1] || '',
                        district: values[2] || '',
                        location: values[3] || '',
                        longitude: parseFloat(values[4]) || 0,
                        latitude: parseFloat(values[5]) || 0,
                        year: parseInt(values[6]) || 2023,
                        pH: parseFloat(values[7]) || 0,
                        ec: parseFloat(values[8]) || 0,
                        co3: parseFloat(values[9]) || 0,
                        hco3: parseFloat(values[10]) || 0,
                        cl: parseFloat(values[11]) || 0,
                        f: parseFloat(values[12]) || 0,
                        so4: parseFloat(values[13]) || 0,
                        no3: parseFloat(values[14]) || 0,
                        po4: parseFloat(values[15]) || 0,
                        totalHardness: parseFloat(values[16]) || 0,
                        ca: parseFloat(values[17]) || 0,
                        mg: parseFloat(values[18]) || 0,
                        na: parseFloat(values[19]) || 0,
                        k: parseFloat(values[20]) || 0,
                        fe: parseFloat(values[21]) || 0,
                        as: parseFloat(values[22]) || 0,
                        u: parseFloat(values[23]) || 0
                    };
                    samples.push(sample);
                }
                catch (error) {
                    console.warn(`Skipping invalid line ${i + 1}: ${error}`);
                }
            }
            return samples;
        }
        catch (error) {
            console.error('Error parsing CSV file:', error);
            return [];
        }
    }
    static parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    static convertToWaterSample(csvSample, collectedBy) {
        const hmpiValue = (csvSample.fe * 0.1) + (csvSample.as * 0.01) + (csvSample.u * 0.01);
        let status = 'safe';
        if (hmpiValue > 100 || csvSample.as > 10 || csvSample.u > 30) {
            status = 'high';
        }
        else if (hmpiValue > 50 || csvSample.as > 5 || csvSample.u > 15) {
            status = 'marginal';
        }
        return {
            location: `${csvSample.location}, ${csvSample.district}, ${csvSample.state}`,
            latitude: csvSample.latitude,
            longitude: csvSample.longitude,
            sample_date: new Date(csvSample.year, 0, 1),
            collected_by: collectedBy,
            cu_concentration: csvSample.fe * 0.1,
            pb_concentration: csvSample.as * 0.1,
            cd_concentration: csvSample.u * 0.1,
            zn_concentration: csvSample.mg * 0.1,
            hmpi_value: hmpiValue,
            status: status,
            notes: `pH: ${csvSample.pH}, EC: ${csvSample.ec}µS/cm, Hardness: ${csvSample.totalHardness}mg/L`,
            additional_data: {
                pH: csvSample.pH,
                ec: csvSample.ec,
                co3: csvSample.co3,
                hco3: csvSample.hco3,
                cl: csvSample.cl,
                f: csvSample.f,
                so4: csvSample.so4,
                no3: csvSample.no3,
                po4: csvSample.po4,
                totalHardness: csvSample.totalHardness,
                ca: csvSample.ca,
                mg: csvSample.mg,
                na: csvSample.na,
                k: csvSample.k,
                fe: csvSample.fe,
                as: csvSample.as,
                u: csvSample.u
            }
        };
    }
}
exports.CSVParser = CSVParser;
//# sourceMappingURL=csvParser.js.map