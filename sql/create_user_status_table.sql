-- Function to create user_status table if it doesn't exist
CREATE OR REPLACE FUNCTION create_user_status_table_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'user_status'
    ) THEN
        -- Create the table
        CREATE TABLE public.user_status (
            user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Add comment
        COMMENT ON TABLE public.user_status IS 'Stores user account status (active, blocked, etc.)';
    END IF;
END;
$$ LANGUAGE plpgsql;
