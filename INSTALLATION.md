# PTC Command & Control Dashboard - Installation Guide

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v12 or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** (comes with Node.js)
- A code editor (VS Code recommended)

## 🚀 Step-by-Step Installation

### Step 1: Database Setup

1. **Start PostgreSQL**
   ```bash
   # On Windows
   # PostgreSQL should start automatically, or use Services

   # On Mac
   brew services start postgresql

   # On Linux
   sudo service postgresql start
   ```

2. **Open PostgreSQL Command Line**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   ```

3. **Run the Setup Script**
   ```sql
   -- Copy and paste the entire contents of database/setup.sql
   -- Or run it from file:
   \i /path/to/database/setup.sql
   ```

   **OR manually run these commands:**
   ```sql
   CREATE DATABASE command_control_dashboard_db;
   \c command_control_dashboard_db
   -- Then run all CREATE TABLE commands
   -- Then run all INSERT commands
   ```

4. **Verify Database Creation**
   ```sql
   -- List all tables
   \dt

   -- Check data
   SELECT COUNT(*) FROM routes;
   SELECT COUNT(*) FROM users;
   ```

### Step 2: Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env with your settings
   nano .env  # or use any text editor
   ```

   **Update these values in `.env`:**
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=command_control_dashboard_db
   DB_HOST=localhost
   DB_PORT=5432
   PORT=5000
   ```

4. **Start Backend Server**
   ```bash
   npm start
   ```

   You should see:
   ```
   Server is running on port 5000
   Database connected successfully
   ```

### Step 3: Frontend Setup

1. **Open New Terminal and Navigate to Frontend**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

   This will install:
   - React & React Router
   - Axios for API calls
   - Lucide React for icons
   - Tailwind CSS for styling

3. **Create Environment File (Optional)**
   ```bash
   cp .env.example .env
   ```

4. **Start Frontend Development Server**
   ```bash
   npm start
   ```

   The application will open automatically at `http://localhost:3000`

### Step 4: First Login

1. Open your browser and go to `http://localhost:3000`

2. **Login with default credentials:**
   ```
   Email: admin@ptc.gov.pk
   Password: admin123
   ```

3. You should see the Command & Control Dashboard!

## ✅ Verification Checklist

After installation, verify everything works:

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can login successfully
- [ ] Dashboard loads with statistics
- [ ] Can navigate to all pages (Fleet, Routes, Users, etc.)
- [ ] Data appears in tables
- [ ] No console errors in browser (F12)

## 🐛 Troubleshooting

### Backend Issues

**Problem: "Database connection error"**
```bash
Solution:
1. Check PostgreSQL is running
2. Verify credentials in backend/.env
3. Ensure database exists: psql -l
4. Check firewall/port 5432
```

**Problem: "Port 5000 already in use"**
```bash
Solution:
# Change PORT in backend/.env to 5001 or any available port
# Update frontend/src/api.js API_BASE_URL accordingly
```

**Problem: "Module not found"**
```bash
Solution:
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Problem: "Cannot connect to backend"**
```bash
Solution:
1. Ensure backend is running (check http://localhost:5000/api/health)
2. Check API_BASE_URL in frontend/src/api.js
3. Check browser console for CORS errors
```

**Problem: "npm start fails"**
```bash
Solution:
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

**Problem: "Blank page after login"**
```bash
Solution:
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify all component files exist in src/components/
4. Clear browser cache and reload
```

### Database Issues

**Problem: "Table does not exist"**
```sql
Solution:
-- Reconnect to database
\c command_control_dashboard_db

-- List tables to verify
\dt

-- If tables missing, re-run setup script
\i /path/to/database/setup.sql
```

**Problem: "Foreign key constraint violation"**
```sql
Solution:
-- This means data wasn't inserted in correct order
-- Drop all tables and re-run setup
DROP TABLE IF EXISTS fare_transactions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS bus_locations CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS fare_media CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS routes CASCADE;

-- Then re-run setup.sql
```

## 🔧 Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- **Backend**: Use `nodemon` instead of `node`
- **Frontend**: Changes auto-reload in browser

### API Testing
Test backend endpoints with curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Login (get token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ptc.gov.pk","password":"admin123"}'

# Use token for other requests
curl http://localhost:5000/api/buses/locations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Database Management

**View data:**
```bash
psql -U postgres -d command_control_dashboard_db
```

```sql
-- View all routes
SELECT * FROM routes;

-- View active trips
SELECT * FROM trips WHERE status = 'Ongoing';

-- View incidents with route names
SELECT i.*, r.route_name 
FROM incidents i
JOIN trips t ON i.trip_id = t.trip_id
JOIN routes r ON t.route_id = r.route_id;
```

**Backup database:**
```bash
pg_dump -U postgres command_control_dashboard_db > backup.sql
```

**Restore database:**
```bash
psql -U postgres command_control_dashboard_db < backup.sql
```

## 📦 Project Structure

```
command-control-dashboard/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── routes.js
│   │   ├── trips.js
│   │   ├── buses.js
│   │   ├── incidents.js
│   │   ├── alerts.js
│   │   ├── tickets.js
│   │   └── analytics.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Sidebar.js
│   │   │   ├── Header.js
│   │   │   ├── Dashboard.js
│   │   │   ├── FleetManagement.js
│   │   │   ├── LiveMap.js
│   │   │   ├── UserManagement.js
│   │   │   ├── RouteManagement.js
│   │   │   ├── IncidentManagement.js
│   │   │   ├── AlertSystem.js
│   │   │   ├── Analytics.js
│   │   │   └── TicketingSystem.js
│   │   ├── App.js
│   │   ├── api.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── tailwind.config.js
├── database/
│   └── setup.sql
└── README.md
```

## 🎯 Next Steps

After successful installation:

1. **Explore the Dashboard**
   - Navigate through all modules
   - Try creating/editing/deleting records
   - Check the analytics page

2. **Customize**
   - Add more routes in Route Management
   - Create more users in User Management
   - Update the color scheme in Tailwind config

3. **Integrate Maps** (Optional)
   - Install Leaflet: `npm install react-leaflet leaflet`
   - Replace map placeholder in LiveMap.js
   - Add real GPS tracking

4. **Add Features**
   - Email notifications
   - PDF report generation
   - Real-time WebSocket updates
   - Mobile app integration

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review console logs (Backend terminal & Browser console)
3. Verify all files are created correctly
4. Check PostgreSQL logs

## 🎉 Success!

If everything is working, you should see:
- ✅ Login page with PTC branding
- ✅ Dashboard with statistics
- ✅ All navigation links working
- ✅ Data loading in tables
- ✅ No errors in console

**Congratulations! Your Command & Control Dashboard is ready to use!**