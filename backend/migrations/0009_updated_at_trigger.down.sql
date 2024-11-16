DROP TRIGGER IF EXISTS trigger_updated_at ON users;

DROP TRIGGER IF EXISTS trigger_updated_at ON admins;

DROP TRIGGER IF EXISTS trigger_updated_at ON groups;

DROP TRIGGER IF EXISTS trigger_updated_at ON sessions;

DROP TRIGGER IF EXISTS trigger_updated_at ON attendance;

DROP TRIGGER IF EXISTS trigger_updated_at ON logs;

DROP TRIGGER IF EXISTS trigger_updated_at ON rfid_logs;

DROP FUNCTION IF EXISTS set_updated_at;
