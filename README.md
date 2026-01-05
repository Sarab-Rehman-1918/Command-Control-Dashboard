# Command & Control Dashboard - Punjab Transport Company

A comprehensive web-based dashboard for managing fleet operations, real-time tracking, incident management, and analytics for the Punjab Transport Company's bus service.

## 🚀 Features

### Core Modules
1. **Dashboard** - Real-time overview of fleet status, incidents, and key metrics
2. **Live Map** - GPS-based real-time fleet tracking
3. **Fleet Management** - Manage all buses and their current status
4. **Route Management** - Create, update, and monitor bus routes
5. **Incident Management** - Track and resolve incidents in real-time
6. **Alert System** - Automated alerts for critical events
7. **Analytics & Reports** - Comprehensive data analysis and reporting
8. **Ticketing System** - Overview of bookings and payments
9. **User Management** - Manage staff, drivers, and administrators

### Admin Capabilities
- Full CRUD operations on all entities
- User role management
- Route creation and modification
- Incident resolution tracking
- System-wide analytics access

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🛠️ Installation

### 1. Database Setup

First, set up your PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE command_control_dashboard_db;

# Connect to database
\c command_control_dashboard_db
```

Run all the SQL commands from your document to create tables:

```sql
-- Create tables (in order)
CREATE TABLE trips (
  trip_id SERIAL PRIMARY KEY,
  status VARCHAR(20) NOT NULL,
  route_id INT NOT NULL
);

CREATE TABLE routes (
  route_id SERIAL PRIMARY KEY,
  route_name VARCHAR(50),
  start_point VARCHAR(50),
  end_point VARCHAR(50),
  total_distance DECIMAL(5,2)
);

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  role VARCHAR(20),
  contact VARCHAR(20)
);

CREATE TABLE bus_locations (
  bus_id INT NOT NULL,
  trip_id INT NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  recorded_at TIMESTAMP NOT NULL,
  PRIMARY KEY (bus_id, trip_id, recorded_at),
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

CREATE TABLE incidents (
  incident_id SERIAL PRIMARY KEY,
  trip_id INT NOT NULL,
  bus_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20),
  status VARCHAR(20),
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

CREATE TABLE alerts (
  alert_id SERIAL PRIMARY KEY,
  incident_id INT NOT NULL,
  alert_type VARCHAR(50),
  message TEXT,
  recipient_role VARCHAR(50),
  FOREIGN KEY (incident_id) REFERENCES incidents(incident_id)
);

CREATE TABLE tickets (
  ticket_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  trip_id INT NOT NULL,
  seat_number VARCHAR(10),
  price DECIMAL(8,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL,
  amount DECIMAL(8,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20) NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
);

CREATE TABLE fare_media (
  media_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  media_type VARCHAR(20) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE fare_transactions (
  transaction_id SERIAL PRIMARY KEY,
  media_id INT NOT NULL,
  ticket_id INT,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(8,2) NOT NULL,
  transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (media_id) REFERENCES fare_media(media_id),
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
);
```

Then insert the mock data from your document.

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
nano .env

# Start the server
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`

## 🔐 Default Login Credentials

```
Email: admin@ptc.gov.pk
Password: admin123
```

## 📁 Project Structure

```
command-control-dashboard/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management
│   │   ├── trips.js             # Trip management
│   │   ├── buses.js             # Bus location tracking
│   │   ├── routes.js            # Route management
│   │   ├── incidents.js         # Incident management
│   │   ├── alerts.js            # Alert system
│   │   ├── tickets.js           # Ticketing system
│   │   └── analytics.js         # Analytics endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── server.js                # Main server file
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # All React components
│   │   ├── App.js              # Main app component
│   │   ├── api.js              # API configuration
│   │   └── index.js            # Entry point
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get route by ID
- `POST /api/routes` - Create route (Admin only)
- `PUT /api/routes/:id` - Update route (Admin only)
- `DELETE /api/routes/:id` - Delete route (Admin only)

### Buses
- `GET /api/buses/locations` - Get all bus locations
- `GET /api/buses/locations/:busId` - Get specific bus location history
- `POST /api/buses/locations` - Add new bus location
- `GET /api/buses/fleet/stats` - Get fleet statistics

### Trips
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get trip by ID
- `GET /api/trips/active/list` - Get active trips
- `POST /api/trips` - Create trip (Admin only)
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip (Admin only)

### Incidents
- `GET /api/incidents` - Get all incidents
- `GET /api/incidents/:id` - Get incident by ID
- `GET /api/incidents/stats/summary` - Get incident statistics
- `POST /api/incidents` - Create incident
- `PUT /api/incidents/:id` - Update incident
- `DELETE /api/incidents/:id` - Delete incident (Admin only)

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/recent/list` - Get recent alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert (Admin only)

### Analytics
- `GET /api/analytics/dashboard/summary` - Dashboard summary stats
- `GET /api/analytics/revenue?period=daily` - Revenue analytics
- `GET /api/analytics/routes/performance` - Route performance
- `GET /api/analytics/incidents/trends` - Incident trends

## 🎨 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Leaflet** - Maps (optional integration)
- **Chart.js** - Data visualization (optional)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- SQL injection prevention (parameterized queries)
- CORS configuration

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🚧 Future Enhancements

- Real-time WebSocket updates
- Push notifications
- Mobile app integration
- Advanced analytics dashboards
- PDF report generation
- Email notifications
- SMS alerts integration
- Biometric access logging

## 🤝 Contributing

This project is part of the Punjab Transport Company modernization initiative.

## 📄 License

Proprietary - Punjab Transport Company

## 👥 Team

Module 3: Command and Control Dashboard Team

## 📞 Support

For technical support, contact the development team.

---

**Last Updated:** January 2026