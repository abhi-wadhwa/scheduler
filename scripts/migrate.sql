CREATE TABLE IF NOT EXISTS time_slots (
  id VARCHAR(50) PRIMARY KEY,
  date DATE NOT NULL,
  time_label VARCHAR(20) NOT NULL,
  display_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  slot_id VARCHAR(50) NOT NULL REFERENCES time_slots(id),
  spot_index INT NOT NULL CHECK (spot_index >= 0 AND spot_index <= 2),
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(slot_id, spot_index)
);
