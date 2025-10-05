-- Drop the table if it already exists to start fresh
DROP TABLE IF EXISTS watches;

-- Create the watches table
CREATE TABLE watches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  serial_number TEXT NOT NULL,
  model TEXT NOT NULL,
  color TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('lost', 'found', 'reunited')),
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  latitude REAL,
  longitude REAL,
  contact_info TEXT -- Placeholder for user contact info
);

-- Seed the database with dummy data in and around San Antonio, TX
INSERT INTO watches (serial_number, model, color, status, latitude, longitude, contact_info) VALUES
-- 6 Lost Watches
('F9G8H7J6K5L4', 'Series 9', 'Midnight', 'lost', 29.4851, -98.5523, 'seed@example.com'),
('A1B2C3D4E5F6', 'Ultra 2', 'Titanium', 'lost', 29.3511, -98.4187, 'seed@example.com'),
('Z9Y8X7W6V5U4', 'SE', 'Starlight', 'lost', 29.5398, -98.6001, 'seed@example.com'),
('Q1W2E3R4T5Y6', 'Series 8', 'Red', 'lost', 29.4025, -98.4859, 'seed@example.com'),
('M9N8B7V6C5X4', 'Series 9', 'Silver', 'lost', 29.3376, -98.5314, 'seed@example.com'),
('P0O9I8U7Y6T5', 'Ultra', 'Titanium', 'lost', 29.4719, -98.3992, 'seed@example.com'),
-- 8 Found Watches
('L5K4J3H2G1F0', 'Series 7', 'Green', 'found', 29.4182, -98.5076, 'seed@example.com'),
('T5R4E3W2Q1P0', 'SE', 'Silver', 'found', 29.5013, -98.5845, 'seed@example.com'),
('G6H7J8K9L0M1', 'Series 9', 'Pink', 'found', 29.3867, -98.4402, 'seed@example.com'),
('V5C4X3Z2A1S0', 'Ultra 2', 'Titanium', 'found', 29.4533, -98.5298, 'seed@example.com'),
('B4N5M67L8K9', 'Series 8', 'Midnight', 'found', 29.3994, -98.3756, 'seed@example.com'),
('Y2U3I4O5P6L7', 'Series 6', 'Blue', 'found', 29.5540, -98.4911, 'seed@example.com'),
('H9J8K7L6G5F4', 'SE', 'Starlight', 'found', 29.3109, -98.4627, 'seed@example.com'),
('D3S2A1F0G9H8', 'Series 9', 'Gold', 'found', 29.4395, -98.6143, 'seed@example.com');

