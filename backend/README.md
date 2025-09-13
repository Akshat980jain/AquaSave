# AquaSafe Backend API

A comprehensive Node.js backend for the AquaSafe Water Quality Analysis system.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Water Sample Management**: CRUD operations for water quality samples
- **HMPI Calculation**: Automatic Heavy Metal Pollution Index calculation
- **Data Filtering & Pagination**: Advanced querying capabilities
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive request validation
- **SQLite Database**: Lightweight, embedded database
- **TypeScript**: Full type safety
- **Security**: Helmet, CORS, and other security middleware

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Water Samples
- `GET /api/samples` - Get all samples (with filtering)
- `GET /api/samples/statistics` - Get sample statistics
- `GET /api/samples/:id` - Get specific sample
- `POST /api/samples` - Create new sample (higher officials only)
- `PUT /api/samples/:id` - Update sample (higher officials only)
- `DELETE /api/samples/:id` - Delete sample (higher officials only)

### Health Check
- `GET /api/health` - API health status

## User Roles

### Higher Official
- Full access to all data
- Can create, update, and delete samples
- Access to detailed analytics

### Lower Official
- Limited data access (first 10 samples)
- Read-only access
- Basic statistics only

## Default Users

```
Higher Official:
Username: higher_admin
Password: admin123

Lower Official:
Username: lower_admin
Password: user123
```

## Sample Data Structure

```json
{
  "id": "sample_1",
  "location": "Delhi - Yamuna River - Site 1",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "sample_date": "2024-01-15T10:30:00Z",
  "collected_by": "user_1",
  "cu_concentration": 0.8,
  "pb_concentration": 0.05,
  "cd_concentration": 0.002,
  "zn_concentration": 1.2,
  "hmpi_value": 45.2,
  "status": "safe",
  "notes": "Within acceptable limits"
}
```

## HMPI Calculation

The Heavy Metal Pollution Index is calculated using:
```
HMPI = (Cu × 10) + (Pb × 100) + (Cd × 1000) + (Zn × 5)
```

Status Classification:
- **Safe**: HMPI < 50
- **Marginal**: 50 ≤ HMPI < 100
- **High**: HMPI ≥ 100

## Environment Variables

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=./data/aquasafe.db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Security Features

- JWT token authentication
- Role-based access control
- Rate limiting (100 requests per 15 minutes)
- Input validation with Joi
- SQL injection prevention
- CORS protection
- Security headers with Helmet

## Database Schema

### Users Table
- id (TEXT PRIMARY KEY)
- username (TEXT UNIQUE)
- email (TEXT UNIQUE)
- name (TEXT)
- role (TEXT)
- password_hash (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

### Water Samples Table
- id (TEXT PRIMARY KEY)
- location (TEXT)
- latitude (REAL)
- longitude (REAL)
- sample_date (DATETIME)
- collected_by (TEXT, FK to users.id)
- cu_concentration (REAL)
- pb_concentration (REAL)
- cd_concentration (REAL)
- zn_concentration (REAL)
- hmpi_value (REAL)
- status (TEXT)
- notes (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

## Development

The API automatically creates sample data on first run, including:
- 50 water samples from major Indian cities
- Realistic metal concentration values
- Calculated HMPI values and status classifications
- Geographic distribution across India

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Rate Limiting

- 100 requests per 15-minute window per IP
- Returns 429 status with retry-after header when exceeded
- Configurable via environment variables