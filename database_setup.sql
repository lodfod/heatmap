-- Create the events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    event_count INTEGER DEFAULT 0,
    is_hot BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional fields from your create form
    date TEXT,
    location TEXT,
    created_by TEXT,
    imageUrl TEXT,
    event_visibility BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_genre ON public.events(genre);
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (adjust based on your auth requirements)
CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert events" ON public.events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update events" ON public.events
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete events" ON public.events
    FOR DELETE USING (true);

-- Grant necessary permissions
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.events TO anon; 