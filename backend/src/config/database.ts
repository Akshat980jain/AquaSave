import mongoose from 'mongoose';
import { User } from '../models/User';
import { WaterSample } from '../models/WaterSample';
import { CSVParser } from '../services/csvParser';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aquasafe';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB database');
    await initializeDatabase();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const db = mongoose.connection;

async function initializeDatabase() {
  // Insert default users if they don't exist
  await insertDefaultUsers();
  
  // Insert sample data if collection is empty
  await insertSampleData();
}

async function insertDefaultUsers() {
  const bcrypt = require('bcryptjs');
  
  const users = [
    {
      username: 'higher_admin',
      email: 'sarah.johnson@env.gov',
      name: 'Dr. Sarah Johnson',
      role: 'higher_official',
      password: 'admin123'
    },
    {
      username: 'lower_admin',
      email: 'mark.thompson@env.gov',
      name: 'Mark Thompson',
      role: 'lower_official',
      password: 'user123'
    }
  ];

  for (const user of users) {
    const existingUser = await User.findOne({ username: user.username });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        password_hash: hashedPassword
      });
      console.log(`Created user: ${user.username}`);
    }
  }
}

async function insertSampleData() {
  try {
    const sampleCount = await WaterSample.countDocuments();
    
    if (sampleCount === 0) {
      // Try to load CSV data first
      const csvPath = path.join(__dirname, '../../../../Frontend/filtered_output.csv');
      let samples;
      
      try {
        const csvData = CSVParser.parseCSVData(csvPath);
        if (csvData.length > 0) {
          // Get user IDs for collected_by field
          const users = await User.find({}, '_id');
          const userIds = users.map(user => (user._id as any).toString());
          
          // Convert CSV data to WaterSample format (limit to first 100 samples for performance)
          samples = csvData.slice(0, 100).map(csvSample => 
            CSVParser.convertToWaterSample(csvSample, userIds[Math.floor(Math.random() * userIds.length)])
          );
          console.log(`Loaded ${samples.length} samples from CSV data`);
        } else {
          throw new Error('No CSV data found');
        }
      } catch (csvError) {
        console.log('CSV data not available, using generated sample data');
        samples = await generateSampleData();
      }
      
      await WaterSample.insertMany(samples);
      console.log('Sample data inserted successfully');
    }
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

async function generateSampleData() {
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

  // Get user IDs for collected_by field
  const users = await User.find({}, '_id');
  const userIds = users.map(user => (user._id as any).toString());

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
      location: `${location.name} - Site ${Math.floor(i / 10) + 1}`,
      latitude: location.lat + (Math.random() - 0.5) * 0.1,
      longitude: location.lng + (Math.random() - 0.5) * 0.1,
      sample_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      collected_by: userIds[Math.floor(Math.random() * userIds.length)],
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