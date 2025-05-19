-- Create a function to create the health_metrics table if it doesn't exist
CREATE OR REPLACE FUNCTION create_health_metrics_table()
RETURNS void AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'health_metrics'
  ) THEN
    -- Create the health_metrics table
    CREATE TABLE public.health_metrics (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      metric_type TEXT NOT NULL,
      value NUMERIC NOT NULL,
      unit TEXT NOT NULL,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    -- Add RLS policies
    ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

    -- Policy for selecting own health metrics
    CREATE POLICY select_own_health_metrics ON public.health_metrics
      FOR SELECT USING (auth.uid() = user_id);

    -- Policy for inserting own health metrics
    CREATE POLICY insert_own_health_metrics ON public.health_metrics
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Policy for updating own health metrics
    CREATE POLICY update_own_health_metrics ON public.health_metrics
      FOR UPDATE USING (auth.uid() = user_id);

    -- Policy for deleting own health metrics
    CREATE POLICY delete_own_health_metrics ON public.health_metrics
      FOR DELETE USING (auth.uid() = user_id);

    -- Create index on user_id and metric_type for faster queries
    CREATE INDEX idx_health_metrics_user_id ON public.health_metrics(user_id);
    CREATE INDEX idx_health_metrics_metric_type ON public.health_metrics(metric_type);
    CREATE INDEX idx_health_metrics_date ON public.health_metrics(date);
  END IF;
END;
$$ LANGUAGE plpgsql;
