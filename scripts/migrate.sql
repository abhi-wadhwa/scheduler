CREATE TABLE IF NOT EXISTS time_slots (
  id VARCHAR(50) PRIMARY KEY,
  date DATE NOT NULL,
  time_label VARCHAR(20) NOT NULL,
  display_order INT NOT NULL,
  location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  slot_id VARCHAR(50) NOT NULL REFERENCES time_slots(id),
  spot_index INT NOT NULL CHECK (spot_index >= 0 AND spot_index <= 2),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(slot_id, spot_index)
);

-- Run these if tables already exist:
-- ALTER TABLE time_slots ADD COLUMN IF NOT EXISTS location VARCHAR(255);
-- ALTER TABLE bookings ADD COLUMN IF NOT EXISTS email VARCHAR(255);
