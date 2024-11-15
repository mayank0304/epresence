-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the triggers for each table individually

-- For users table
CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- For admins table
CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- For groups table
CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- For sessions table
CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- For attendance table
CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON attendance
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- For logs table
CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON logs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- For rfid_logs table
CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON rfid_logs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
