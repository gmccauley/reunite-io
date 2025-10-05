-- This file defines the table structure for the D1 database.
-- It is executed via the `wrangler d1 execute` command.

DROP TABLE IF EXISTS found_watches;

CREATE TABLE found_watches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_number TEXT NOT NULL UNIQUE,
    model TEXT,
    location_found TEXT,
    description TEXT,
    finder_email TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

