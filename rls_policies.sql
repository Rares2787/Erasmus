-- ============================================================================
-- LER EduShare — Row Level Security Policies
-- Rulează în Supabase → SQL Editor → New query → Run
-- ============================================================================

-- Activare RLS pe toate tabelele
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_messages ENABLE ROW LEVEL SECURITY;

-- USERS: oricine poate citi (pentru autentificare)
CREATE POLICY "Allow read users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow insert users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update users" ON users
    FOR UPDATE USING (true);

-- RESOURCES: oricine poate citi, insera, actualiza, sterge
CREATE POLICY "Allow read resources" ON resources
    FOR SELECT USING (true);

CREATE POLICY "Allow insert resources" ON resources
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update resources" ON resources
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete resources" ON resources
    FOR DELETE USING (true);

-- REPORTS: oricine poate citi, insera, actualiza
CREATE POLICY "Allow read reports" ON reports
    FOR SELECT USING (true);

CREATE POLICY "Allow insert reports" ON reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update reports" ON reports
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete reports" ON reports
    FOR DELETE USING (true);

-- PEER MESSAGES: oricine poate citi si scrie
CREATE POLICY "Allow read peer_messages" ON peer_messages
    FOR SELECT USING (true);

CREATE POLICY "Allow insert peer_messages" ON peer_messages
    FOR INSERT WITH CHECK (true);
