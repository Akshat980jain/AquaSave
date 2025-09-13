"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const WaterSample_1 = require("../models/WaterSample");
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aquasafe';
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB database');
        await initializeDatabase();
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
exports.db = mongoose_1.default.connection;
async function initializeDatabase() {
    await insertDefaultUsers();
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
        const existingUser = await User_1.User.findOne({ username: user.username });
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await User_1.User.create({
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
        const sampleCount = await WaterSample_1.WaterSample.countDocuments();
        if (sampleCount === 0) {
            const samples = generateSampleData();
            await WaterSample_1.WaterSample.insertMany(samples);
            console.log('Sample data inserted successfully');
        }
    }
    catch (error) {
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
    const users = await User_1.User.find({}, '_id');
    const userIds = users.map(user => user._id.toString());
    const samples = [];
    for (let i = 0; i < 50; i++) {
        const location = locations[i % locations.length];
        const cu = Math.random() * 3;
        const pb = Math.random() * 0.3;
        const cd = Math.random() * 0.02;
        const zn = Math.random() * 5;
        const hmpi = (cu * 10) + (pb * 100) + (cd * 1000) + (zn * 5) + Math.random() * 20;
        let status;
        if (hmpi < 50)
            status = 'safe';
        else if (hmpi < 100)
            status = 'marginal';
        else
            status = 'high';
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
exports.default = exports.db;
//# sourceMappingURL=database.js.map