import { db } from '../config/database';
import { WaterSample, PaginationQuery, SampleFilters } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
  ): Promise<{ samples: WaterSample[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.location) {
      whereClause += ' AND location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.dateFrom) {
      whereClause += ' AND sample_date >= ?';
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      whereClause += ' AND sample_date <= ?';
      params.push(filters.dateTo);
    }

    if (filters.hmpiMin !== undefined) {
      whereClause += ' AND hmpi_value >= ?';
      params.push(filters.hmpiMin);
    }

    if (filters.hmpiMax !== undefined) {
      whereClause += ' AND hmpi_value <= ?';
      params.push(filters.hmpiMax);
    }

    // Limit data for lower officials
    if (userRole === 'lower_official') {
      whereClause += ' LIMIT 10';
    }

    const query = `
      SELECT * FROM water_samples 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM water_samples ${whereClause}
    `;

    return new Promise((resolve, reject) => {
      // Get total count
      db.get(countQuery, params, (err, countRow: any) => {
        if (err) {
          reject(err);
          return;
        }

        // Get samples
        db.all(query, [...params, limit, offset], (err, rows: WaterSample[]) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              samples: rows || [],
              total: countRow.total || 0
            });
          }
        });
      });
    });
  }

  static async findById(id: string): Promise<WaterSample | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM water_samples WHERE id = ?',
        [id],
        (err, row: WaterSample) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  static async create(sampleData: Partial<WaterSample>, userId: string): Promise<WaterSample> {
    const id = uuidv4();
    const hmpi = this.calculateHMPI(
      sampleData.cu_concentration!,
      sampleData.pb_concentration!,
      sampleData.cd_concentration!,
      sampleData.zn_concentration!
    );
    const status = this.determineStatus(hmpi);

    const sample: Partial<WaterSample> = {
      id,
      ...sampleData,
      hmpi_value: hmpi,
      status,
      collected_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO water_samples (
          id, location, latitude, longitude, sample_date, collected_by,
          cu_concentration, pb_concentration, cd_concentration, zn_concentration,
          hmpi_value, status, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        sample.id, sample.location, sample.latitude, sample.longitude,
        sample.sample_date, sample.collected_by, sample.cu_concentration,
        sample.pb_concentration, sample.cd_concentration, sample.zn_concentration,
        sample.hmpi_value, sample.status, sample.notes, sample.created_at, sample.updated_at
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(sample as WaterSample);
        }
      });
    });
  }

  static async update(id: string, updateData: Partial<WaterSample>): Promise<WaterSample | null> {
    const existing = await this.findById(id);
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

    const updatedSample = {
      ...existing,
      ...updateData,
      hmpi_value: hmpi,
      status,
      updated_at: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE water_samples SET
          location = ?, latitude = ?, longitude = ?, sample_date = ?,
          cu_concentration = ?, pb_concentration = ?, cd_concentration = ?, zn_concentration = ?,
          hmpi_value = ?, status = ?, notes = ?, updated_at = ?
        WHERE id = ?
      `, [
        updatedSample.location, updatedSample.latitude, updatedSample.longitude,
        updatedSample.sample_date, updatedSample.cu_concentration,
        updatedSample.pb_concentration, updatedSample.cd_concentration,
        updatedSample.zn_concentration, updatedSample.hmpi_value,
        updatedSample.status, updatedSample.notes, updatedSample.updated_at, id
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(updatedSample);
        }
      });
    });
  }

  static async delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM water_samples WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  static async getStatistics(userRole?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let limitClause = '';
      if (userRole === 'lower_official') {
        limitClause = 'LIMIT 10';
      }

      db.all(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'safe' THEN 1 END) as safe,
          COUNT(CASE WHEN status = 'marginal' THEN 1 END) as marginal,
          COUNT(CASE WHEN status = 'high' THEN 1 END) as high,
          AVG(hmpi_value) as avg_hmpi,
          AVG(cu_concentration) as avg_cu,
          AVG(pb_concentration) as avg_pb,
          AVG(cd_concentration) as avg_cd,
          AVG(zn_concentration) as avg_zn
        FROM water_samples
        ${limitClause}
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });
  }
}