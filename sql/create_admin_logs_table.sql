-- Function to create admin_logs table if it doesn't exist
CREATE OR REPLACE FUNCTION create_admin_logs_table_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Check if the extension exists
    IF NOT EXISTS (
        SELECT FROM pg_extension WHERE extname = 'uuid-ossp'
    ) THEN
        -- Create the extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    END IF;

    -- Check if the table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'admin_logs'
    ) THEN
        -- Create the table
        CREATE TABLE public.admin_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            admin_id TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Add comment
        COMMENT ON TABLE public.admin_logs IS 'Stores admin activity logs';
    END IF;
END;
$$ LANGUAGE plpgsql;
