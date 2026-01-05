# Quick Start Guide - Command & Control Dashboard

## ⚡ Fast Setup (5 minutes)

### Step 1: Database Setup
```sql
-- Open PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE command_control_dashboard_db;
\c command_control_dashboard_db

-- Run all CREATE TABLE commands from your document
-- Then run all INSERT commands for mock data
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env - change DB_PASSWORD to your PostgreSQL password
npm start
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Step 4: Login
- Open browser: `http://localhost:3000`
- Email: `admin@ptc.gov.pk`
- Password: `admin123`

## 📂 Files to Create

### Backend Files
1. `backend/package.json` - Dependencies
2. `backend/config/database.js` - DB connection
3. `backend/middleware/auth.js` - Authentication
4. `backend/routes/auth.js` - Login/verification
5. `backend/routes/users.js` - User CRUD
6. `backend/routes/routes.js` - Route CRUD
7. `backend/routes/trips.js` - Trip CRUD
8. `backend/routes/buses.js` - Bus tracking
9. `backend/routes/incidents.js` - Incident management
10. `backend/routes/alerts.js` - Alert system
11. `backend/routes/tickets.js` - Ticketing
12. `backend/routes/analytics.js` - Analytics
13. `backend/server.js` - Main server
14. `backend/.env` - Configuration

### Frontend Files
1. `frontend/package.json` - Dependencies
2. `frontend/public/index.html` - HTML template
3. `frontend/src/index.js` - Entry point
4. `frontend/src/App.js` - Main app component
5. `frontend/src/api.js` - API configuration

**Note:** The complete React dashboard with all components is provided in the artifact above. You can use it as a single component or split it into separate files.

## 🎯 Key Features

### Admin Functions
✅ Add/Edit/Delete Users
✅ Add/Edit/Delete Routes
✅ Create/Update Trips
✅ Manage Incidents
✅ Create Alerts
✅ View Analytics
✅ Monitor Fleet
✅ Track Buses in Real-time

### Dashboard Views
- **Dashboard** - Overview with key metrics
- **Live Map** - Real-time bus tracking
- **Fleet Management** - Bus status and operations
- **Route Management** - Route CRUD operations
- **Incident Management** - Track and resolve issues
- **Alert System** - Automated notifications
- **Analytics** - Reports and insights
- **User Management** - Staff and driver management
- **Ticketing** - Booking and payment overview

## 🔌 API Testing

Test your backend with curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ptc.gov.pk","password":"admin123"}'

# Get buses (replace TOKEN)
curl http://localhost:5000/api/buses/locations \
  -H "Authorization: Bearer TOKEN"

# Get dashboard stats
curl http://localhost:5000/api/analytics/dashboard/summary \
  -H "Authorization: Bearer TOKEN"
```

## 🛠️ Customization

### Change Database Credentials
Edit `backend/.env`:
```env
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=command_control_dashboard_db
```

### Change Ports
Backend: Edit `PORT` in `backend/.env`
Frontend: Add `PORT=3001` to `frontend/.env` (create if needed)

### Add More Users
Login as admin and go to User Management → Add User

### Add More Routes
Login as admin and go to Route Management → Add Route

## 🐛 Troubleshooting

**Database connection error:**
- Check PostgreSQL is running: `sudo service postgresql status`
- Verify credentials in `backend/.env`
- Ensure database exists: `psql -l`

**Backend won't start:**
- Check if port 5000 is available: `lsof -i :5000`
- Install dependencies: `cd backend && npm install`
- Check Node.js version: `node -v` (needs v16+)

**Frontend won't start:**
- Check if port 3000 is available
- Clear node_modules: `rm -rf node_modules && npm install`
- Check browser console for errors

**Login doesn't work:**
- Check backend is running on port 5000
- Open browser console (F12) to see error messages
- Verify database has the users table

**API returns 401:**
- Token might be expired (24h default)
- Login again to get a new token

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🎨 UI Customization

The dashboard uses Tailwind CSS. To customize colors:

1. Edit color classes in components
2. Blue theme: `bg-blue-600`, `text-blue-600`
3. Change to purple: `bg-purple-600`, `text-purple-600`

## 📊 Database Schema

The system uses these main tables:
- **users** - Staff, drivers, admins
- **routes** - Bus routes with start/end points
- **trips** - Individual trips with status
- **bus_locations** - GPS tracking data
- **incidents** - System incidents and issues
- **alerts** - Notifications and warnings
- **tickets** - Passenger bookings
- **payments** - Payment records
- **fare_media** - Digital wallets/cards
- **fare_transactions** - Transaction history

## 🚀 Production Deployment

Before deploying to production:

1. Change JWT_SECRET in `.env`
2. Use strong database password
3. Enable HTTPS
4. Set up database backups
5. Configure CORS properly
6. Add rate limiting
7. Set up logging
8. Use environment variables for all secrets

## 📞 Support

For issues or questions:
1. Check the error logs
2. Review the README.md
3. Contact the development team

---

**Ready to go?** Run the commands above and your dashboard will be live in 5 minutes! 🎉