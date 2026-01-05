-- ========================================
-- PTC Command & Control Dashboard Database
-- Complete Setup Script
-- ========================================

-- Create Database
CREATE DATABASE command_control_dashboard_db;

-- Connect to Database
\c command_control_dashboard_db

-- ========================================
-- 1. CREATE TABLES
-- ========================================

-- A) Routes Table (Create first - no dependencies)
CREATE TABLE routes (
  route_id SERIAL PRIMARY KEY,
  route_name VARCHAR(50),
  start_point VARCHAR(50),
  end_point VARCHAR(50),
  total_distance DECIMAL(5,2)
);

-- B) Users Table (No dependencies)
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  role VARCHAR(20),
  contact VARCHAR(20)
);

-- C) Trips Table (Depends on routes)
CREATE TABLE trips (
  trip_id SERIAL PRIMARY KEY,
  status VARCHAR(20) NOT NULL,
  route_id INT NOT NULL,
  FOREIGN KEY (route_id) REFERENCES routes(route_id)
);

-- D) Bus Locations Table (Depends on trips)
CREATE TABLE bus_locations (
  bus_id INT NOT NULL,
  trip_id INT NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  recorded_at TIMESTAMP NOT NULL,
  PRIMARY KEY (bus_id, trip_id, recorded_at),
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

-- E) Incidents Table (Depends on trips)
CREATE TABLE incidents (
  incident_id SERIAL PRIMARY KEY,
  trip_id INT NOT NULL,
  bus_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20),
  status VARCHAR(20),
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

-- F) Alerts Table (Depends on incidents)
CREATE TABLE alerts (
  alert_id SERIAL PRIMARY KEY,
  incident_id INT NOT NULL,
  alert_type VARCHAR(50),
  message TEXT,
  recipient_role VARCHAR(50),
  FOREIGN KEY (incident_id) REFERENCES incidents(incident_id)
);

-- G) Tickets Table (Depends on trips)
CREATE TABLE tickets (
  ticket_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  trip_id INT NOT NULL,
  seat_number VARCHAR(10),
  price DECIMAL(8,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

-- H) Payments Table (Depends on tickets)
CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL,
  amount DECIMAL(8,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20) NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
);

-- I) Fare Media Table (No dependencies)
CREATE TABLE fare_media (
  media_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  media_type VARCHAR(20) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- J) Fare Transactions Table (Depends on fare_media and tickets)
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

-- ========================================
-- 2. INSERT MOCK DATA
-- ========================================

-- A) Insert Routes
INSERT INTO routes (route_name, start_point, end_point, total_distance) VALUES
('Route 101', 'UET Lahore', 'Gaddafi Stadium', 12.5),
('Route 102', 'DHA Phase 1', 'Liberty Market', 15.0),
('Route 103', 'Shalimar Gardens', 'Anarkali', 10.2),
('Route 104', 'Ferozepur Road', 'Emporium Mall', 18.7),
('Route 105', 'Johar Town', 'Model Town', 8.9);

-- B) Insert Users
INSERT INTO users (name, role, contact) VALUES
('Ali Khan', 'Driver', '03001234567'),
('Sara Ahmed', 'Driver', '03007654321'),
('Usman Riaz', 'Dispatcher', '03009876543'),
('Hina Qureshi', 'Control Center', '03005678901'),
('Ahmed Malik', 'Admin', '03003456789');

-- C) Insert Trips
INSERT INTO trips (status, route_id) VALUES
('Ongoing', 1),
('Completed', 2),
('Delayed', 3),
('Ongoing', 4),
('Cancelled', 5);

-- D) Insert Bus Locations
INSERT INTO bus_locations (bus_id, trip_id, latitude, longitude, recorded_at) VALUES
(1, 1, 31.5204, 74.3587, '2026-01-03 08:00:00'),
(1, 1, 31.5210, 74.3600, '2026-01-03 08:05:00'),
(2, 2, 31.5000, 74.3500, '2026-01-03 09:00:00'),
(3, 3, 31.5100, 74.3650, '2026-01-03 09:15:00'),
(4, 4, 31.5250, 74.3700, '2026-01-03 10:00:00');

-- E) Insert Incidents
INSERT INTO incidents (trip_id, bus_id, type, severity, status) VALUES
(1, 1, 'Breakdown', 'High', 'Open'),
(3, 3, 'Accident', 'Critical', 'Investigating'),
(2, 2, 'Delay', 'Medium', 'Resolved'),
(4, 4, 'Emergency', 'High', 'Open'),
(1, 1, 'Delay', 'Low', 'Resolved');

-- F) Insert Alerts
INSERT INTO alerts (incident_id, alert_type, message, recipient_role) VALUES
(1, 'System', 'Bus 1 has broken down on Route 101', 'Operations Manager'),
(2, 'System', 'Accident reported for Bus 3 on Route 103', 'Control Center'),
(3, 'Warning', 'Bus 2 delayed by 15 minutes', 'Operations Manager'),
(4, 'Emergency', 'Emergency on Bus 4, assistance needed', 'Control Center'),
(5, 'Info', 'Bus 1 minor delay resolved', 'Operations Manager');

-- G) Insert Tickets
INSERT INTO tickets (user_id, trip_id, seat_number, price, status) VALUES
(1, 1, 'A1', 50.00, 'Booked'),
(2, 1, 'A2', 50.00, 'Booked'),
(3, 2, 'B1', 45.00, 'Cancelled'),
(4, 3, 'C1', 60.00, 'Booked'),
(5, 4, 'D3', 55.00, 'Booked');

-- H) Insert Payments
INSERT INTO payments (ticket_id, amount, payment_method, payment_status) VALUES
(1, 50.00, 'Card', 'Paid'),
(2, 50.00, 'Cash', 'Paid'),
(3, 45.00, 'Online', 'Failed'),
(4, 60.00, 'Card', 'Paid'),
(5, 55.00, 'Online', 'Pending');

-- I) Insert Fare Media
INSERT INTO fare_media (customer_id, media_type, balance, is_active) VALUES
(1, 'Card', 200.00, TRUE),
(2, 'Wallet', 150.00, TRUE),
(3, 'NFC', 0.00, FALSE),
(4, 'Card', 75.00, TRUE),
(5, 'Wallet', 120.00, TRUE);

-- J) Insert Fare Transactions
INSERT INTO fare_transactions (media_id, ticket_id, type, amount) VALUES
(1, 1, 'FARE_DEBIT', 50.00),
(2, 2, 'FARE_DEBIT', 50.00),
(1, NULL, 'TOPUP', 100.00),
(4, 4, 'FARE_DEBIT', 60.00),
(5, NULL, 'TOPUP', 50.00);

-- ========================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_trips_route_id ON trips(route_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_bus_locations_bus_id ON bus_locations(bus_id);
CREATE INDEX idx_bus_locations_trip_id ON bus_locations(trip_id);
CREATE INDEX idx_incidents_trip_id ON incidents(trip_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_alerts_incident_id ON alerts(incident_id);
CREATE INDEX idx_tickets_trip_id ON tickets(trip_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- ========================================
-- SETUP COMPLETE
-- ========================================

SELECT 'Database setup completed successfully!' AS status;