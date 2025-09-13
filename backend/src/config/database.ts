import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_URL || './data/aquasafe.db';
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('higher_official', 'lower_official')) NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create water_samples table
  db.run(`
    CREATE TABLE IF NOT EXISTS water_samples (
      id TEXT PRIMARY KEY,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      sample_date DATETIME NOT NULL,
      collected_by TEXT NOT NULL,
      cu_concentration REAL NOT NULL,
      pb_concentration REAL NOT NULL,
      cd_concentration REAL NOT NULL,
      zn_concentration REAL NOT NULL,
      hmpi_value REAL NOT NULL,
      status TEXT CHECK(status IN ('safe', 'marginal', 'high')) NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collected_by) REFERENCES users (id)
    )
  `);

  // Create indexes for better performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_samples_status ON water_samples(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_samples_date ON water_samples(sample_date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_samples_location ON water_samples(location)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_samples_hmpi ON water_samples(hmpi_value)`);

  // Insert default users if they don't exist
  insertDefaultUsers();
  
  // Insert sample data if table is empty
  insertSampleData();
}

function insertDefaultUsers() {
  const bcrypt = require('bcryptjs');
  
  const users = [
    {
      id: 'user_1',
      username: 'higher_admin',
      email: 'sarah.johnson@env.gov',
      name: 'Dr. Sarah Johnson',
      role: 'higher_official',
      password: 'admin123'
    },
    {
      id: 'user_2',
      username: 'lower_admin',
      email: 'mark.thompson@env.gov',
      name: 'Mark Thompson',
      role: 'lower_official',
      password: 'user123'
    }
  ];

  users.forEach(async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    db.run(`
      INSERT OR IGNORE INTO users (id, username, email, name, role, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [user.id, user.username, user.email, user.name, user.role, hashedPassword]);
  });
}

function insertSampleData() {
  db.get('SELECT COUNT(*) as count FROM water_samples', (err, row: any) => {
    if (err) {
      console.error('Error checking sample data:', err);
      return;
    }

    if (row.count === 0) {
      const samples = generateSampleData();
      samples.forEach((sample) => {
        db.run(`
          INSERT INTO water_samples (
            id, location, latitude, longitude, sample_date, collected_by,
            cu_concentration, pb_concentration, cd_concentration, zn_concentration,
            hmpi_value, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          sample.id, sample.location, sample.latitude, sample.longitude,
          sample.sample_date, sample.collected_by, sample.cu_concentration,
          sample.pb_concentration, sample.cd_concentration, sample.zn_concentration,
          sample.hmpi_value, sample.status, sample.notes
        ]);
      });
      console.log('Sample data inserted successfully');
    }
  });
}

function generateSampleData() {
  const locations = [
    { name: 'Delhi - Yamuna River', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai - Mithi River', lat: 19.0760, lng: 72.8777 },
    { name: 'Bangalore - Vrishabhavathi River', lat: 12.9716, lng: 77.5946 },
    { name: 'Chennai - Cooum River', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata - Hooghly River', lat: 22.5726, lng: 88.3639 },
    { name: 'Hyderabad - Musi River', lat: 17.3850, lng: 78.4867 },
    { name: 'Pune - Mula River', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad - Sabarmati River', lat: 23.0225, lng: 72.5714 },
    { name: 'Jaipur - Dravyavati River', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow - Gomti River', lat: 26.8467, lng: 80.9462 }
  ];

  const samples = [];
  
  for (let i = 0; i < 50; i++) {
    const location = locations[i % locations.length];
    const cu = Math.random() * 3; // 0-3 mg/L
    const pb = Math.random() * 0.3; // 0-0.3 mg/L
    const cd = Math.random() * 0.02; // 0-0.02 mg/L
    const zn = Math.random() * 5; // 0-5 mg/L
    
    // Calculate HMPI (simplified calculation)
    const hmpi = (cu * 10) + (pb * 100) + (cd * 1000) + (zn * 5) + Math.random() * 20;
    
    let status: 'safe' | 'marginal' | 'high';
    if (hmpi < 50) status = 'safe';
    else if (hmpi < 100) status = 'marginal';
    else status = 'high';

    samples.push({
      id: `sample_${i + 1}`,
      location: `${location.name} - Site ${Math.floor(i / 10) + 1}`,
      latitude: location.lat + (Math.random() - 0.5) * 0.1,
      longitude: location.lng + (Math.random() - 0.5) * 0.1,
      sample_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      collected_by: Math.random() > 0.5 ? 'user_1' : 'user_2',
      cu_concentration: cu,
      pb_concentration: pb,
      cd_concentration: cd,
      zn_concentration: zn,
      hmpi_value: hmpi,
      status,
      notes: status === 'high' ? 'Requires immediate attention' : 
             status === 'marginal' ? 'Monitor closely' : 'Within acceptable limits'
    });
  }

  return samples;
}

export default db;