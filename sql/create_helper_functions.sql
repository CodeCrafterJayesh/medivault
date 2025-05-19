-- Function to check if a table exists
CREATE OR REPLACE FUNCTION table_exists(table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create UUID extension if it doesn't exist
CREATE OR REPLACE FUNCTION create_uuid_extension_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_extension WHERE extname = 'uuid-ossp'
  ) THEN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to execute arbitrary SQL
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql;
