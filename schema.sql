-- Drop the table if it exists to ensure a clean slate.
DROP TABLE IF EXISTS watches;

-- Create the watches table with the new model column
CREATE TABLE watches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_number TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('lost', 'found', 'reunited')),
    email TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    reunited_with TEXT,
    date_reported TEXT NOT NULL,
    model TEXT
);

-- Create an index for faster lookups on serial_number
CREATE INDEX idx_serial_number ON watches (serial_number);

-- Seed data for lost watches in/around San Antonio
INSERT INTO watches (serial_number, status, email, latitude, longitude, date_reported, model) VALUES
('F9G8H7J6K5L4', 'lost', 'loser1@example.com', 29.4241, -98.4936, '2025-09-28', 'Series 9'),
('A1B2C3D4E5F6', 'lost', 'loser2@example.com', 29.4252, -98.4918, '2025-10-01', 'Ultra 2'),
('Z9Y8X7W6V5U4', 'lost', 'loser3@example.com', 29.5606, -98.5356, '2025-10-02', 'SE (2nd gen)'),
('M1N2B3V4C5X6', 'lost', 'loser4@example.com', 29.4278, -98.4842, '2025-09-30', 'Series 8'),
('Q1W2E3R4T5Y6', 'lost', 'loser5@example.com', 29.4626, -98.4871, '2025-10-04', 'Ultra'),
('P0O9I8U7Y6T5', 'lost', 'loser6@example.com', 29.5083, -98.4941, '2025-10-03', 'Series 9');

-- Seed data for found watches in/around San Antonio
INSERT INTO watches (serial_number, status, email, latitude, longitude, date_reported, model) VALUES
('G6H7J8K9L0M1', 'found', 'finder1@example.com', 29.4241, -98.4936, '2025-09-29', 'Series 9'),
('L0K9J8H7G6F5', 'found', 'finder2@example.com', 29.4260, -98.4861, '2025-10-02', 'SE (2nd gen)'),
('T5R4E3W2Q1A2', 'found', 'finder3@example.com', 29.5630, -98.5380, '2025-10-03', 'Ultra 2'),
('V5C4X3B2N1M2', 'found', 'finder4@example.com', 29.4288, -98.4882, '2025-10-01', 'Series 7'),
('Y6T5R4E3W2Q1', 'found', 'finder5@example.com', 29.4650, -98.4900, '2025-10-04', 'Series 8'),
('AABBCCDDEEFF', 'found', 'finder6@example.com', 29.5100, -98.4990, '2025-10-04', 'Ultra'),
('GGHHIIJJKKLL', 'found', 'finder7@example.com', 29.4200, -98.4900, '2025-10-01', 'Series 9'),
('MMNNOOPPQQRR', 'found', 'finder8@example.com', 29.5500, -98.5300, '2025-10-02', 'SE (2nd gen)');

