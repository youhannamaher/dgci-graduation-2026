-- Supabase Database Schema Setup for DGCI Graduation 2026
-- Copy and paste this script into the Supabase SQL Editor (Dashboard > SQL Editor > New query).

-- 1. Create GRADUATES Table
CREATE TABLE IF NOT EXISTS graduates (
    id TEXT PRIMARY KEY, -- string slug like 'youhanna-maher'
    order_number INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    photo_url TEXT,
    quote TEXT,
    linkedin TEXT DEFAULT '',
    instagram TEXT DEFAULT '',
    show_profile BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for graduates
ALTER TABLE graduates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access for Graduates" ON graduates FOR SELECT USING (true);
CREATE POLICY "Admin Full Access for Graduates" ON graduates FOR ALL USING (true); -- Custom admin validation via client or service role

-- 2. Create MESSAGES Table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, -- uuid or unique string
    message TEXT NOT NULL CHECK (char_length(message) <= 500),
    sender_name TEXT DEFAULT 'Anonymous',
    is_anonymous BOOLEAN DEFAULT FALSE,
    target_type TEXT NOT NULL CHECK (target_type IN ('class', 'graduate')),
    target_graduate_ids JSONB DEFAULT '[]'::jsonb, -- array of graduate slug ids
    relation TEXT, -- Friend, Family, Professor, Guest, Graduate
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Approved Messages" ON messages FOR SELECT USING (status = 'approved');
CREATE POLICY "Public Insert Messages" ON messages FOR INSERT WITH CHECK (status = 'pending'); -- force pending on insert
CREATE POLICY "Admin Full Access for Messages" ON messages FOR ALL USING (true);

-- 3. Create PHOTOS Table
CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT,
    uploaded_by TEXT DEFAULT 'Anonymous',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for photos
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Approved Photos" ON photos FOR SELECT USING (status = 'approved');
CREATE POLICY "Public Insert Photos" ON photos FOR INSERT WITH CHECK (status = 'pending'); -- force pending on insert
CREATE POLICY "Admin Full Access for Photos" ON photos FOR ALL USING (true);

-- 4. Create PROGRAM_ITEMS Table
CREATE TABLE IF NOT EXISTS program_items (
    id TEXT PRIMARY KEY,
    item_order INTEGER NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for program_items
ALTER TABLE program_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access for Program" ON program_items FOR SELECT USING (true);
CREATE POLICY "Admin Full Access for Program" ON program_items FOR ALL USING (true);

-- 5. Create MEDIA_LINKS Table
CREATE TABLE IF NOT EXISTS media_links (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'photos', 'video_recap', 'video_full'
    url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for media_links
ALTER TABLE media_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access for Media Links" ON media_links FOR SELECT USING (true);
CREATE POLICY "Admin Full Access for Media Links" ON media_links FOR ALL USING (true);

-- 6. Pre-populate default data for Program Items if empty
INSERT INTO program_items (id, item_order, time, title, description, is_current) VALUES
('prog-1', 1, '6:00 PM', 'Guest Arrival & Seating', 'Guests are welcomed and guided to their seats.', true),
('prog-2', 2, '6:30 PM', 'Opening Ceremony', 'Official opening of the DGCI Graduation Ceremony.', false),
('prog-3', 3, '6:45 PM', 'Official Speeches', 'Speeches from university representatives and guests.', false),
('prog-4', 4, '7:30 PM', 'Certificate Distribution', 'Graduates receive their certificates in official order.', false),
('prog-5', 5, '9:00 PM', 'Group Photos', 'Official group and class photos.', false),
('prog-6', 6, '9:30 PM', 'Celebration Moment', 'Closing celebration and memories.', false)
ON CONFLICT (id) DO NOTHING;
