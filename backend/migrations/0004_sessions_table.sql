CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  created_by INTEGER REFERENCES admins (id) NOT NULL,
  group_id INTEGER REFERENCES groups (id) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
