-- ============================================================================
-- LER EduShare — Bază de Date Instituțională (PostgreSQL / Supabase)
-- Liceul Teoretic „Emil Racoviță” Vaslui | Erasmus+ DIGI-EQUAL
-- ============================================================================

-- Activare extensie UUID dacă este necesar
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL UTILIZATORI (Elevi, Profesori, Administratori)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('elev', 'profesor', 'admin')),
    class_grade VARCHAR(50),      -- Ex: 'Clasa a XII-a A' pentru elevi
    department VARCHAR(100),       -- Ex: 'Catedra de Informatică' pentru profesori
    contact_handle VARCHAR(100),   -- Discord/Teams pentru mentorat
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL RESURSE DIDACTICE
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(150) NOT NULL,
    contact_handle VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending_admin' CHECK (status IN ('pending_admin', 'approved', 'rejected')),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(150),
    teacher_comment TEXT,
    description TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    link VARCHAR(500),
    attachment JSONB,              -- { name, size, type, path, url, downloadUrl } pentru PDF / documente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL SESIZĂRI ȘI CORECTURI METODICE (Cadre Didactice -> Admin / Autor)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    resource_title VARCHAR(255) NOT NULL,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    teacher_name VARCHAR(150) NOT NULL,
    target_recipient VARCHAR(20) NOT NULL CHECK (target_recipient IN ('admin', 'author')),
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('minor', 'major')),
    details TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL MENTORAT PEER-TO-PEER (Întrebări între elevi)
CREATE TABLE IF NOT EXISTS peer_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    sender_name VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrare pentru baze de date deja create (sigur de rulat de mai multe ori)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS attachment JSONB;
ALTER TABLE resources ALTER COLUMN content SET DEFAULT '';

-- INDEXURI PENTRU PERFORMANȚĂ
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject);
CREATE INDEX IF NOT EXISTS idx_resources_grade ON resources(grade);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ============================================================================
-- SECURITATE ȘI ACCES (Row Level Security - RLS)
-- Permite cheii anonime din Vercel să acceseze tabelele pe Supabase
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access on users" ON users;
CREATE POLICY "Public access on users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on resources" ON resources;
CREATE POLICY "Public access on resources" ON resources FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on reports" ON reports;
CREATE POLICY "Public access on reports" ON reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on peer_messages" ON peer_messages;
CREATE POLICY "Public access on peer_messages" ON peer_messages FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- STOCARE FIȘIERE (PDF / documente) — Supabase Storage
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('resource-files', 'resource-files', TRUE, 8388608)
ON CONFLICT (id) DO UPDATE SET public = TRUE, file_size_limit = 8388608;

DROP POLICY IF EXISTS "Public read resource files" ON storage.objects;
CREATE POLICY "Public read resource files" ON storage.objects
    FOR SELECT USING (bucket_id = 'resource-files');

DROP POLICY IF EXISTS "Public upload resource files" ON storage.objects;
CREATE POLICY "Public upload resource files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'resource-files');

DROP POLICY IF EXISTS "Public delete resource files" ON storage.objects;
CREATE POLICY "Public delete resource files" ON storage.objects
    FOR DELETE USING (bucket_id = 'resource-files');

-- Activare sincronizare live Realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'resources') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE resources;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'reports') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE reports;
  END IF;
END $$;

-- ============================================================================
-- DATE INITIALE DEMO (Conturi preconfigurate și resurse)
-- ============================================================================

-- Conturi implicite pentru autentificare rapidă:
-- Elev:      elev@ler.ro      / elev123
-- Profesor:  profesor@ler.ro  / prof123
-- Admin:     admin@ler.ro     / admin123

INSERT INTO users (id, email, password_hash, full_name, role, class_grade, department, contact_handle)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'elev@ler.ro', 'elev123', 'Alexandru Popa', 'elev', 'Clasa a XII-a A', NULL, 'Discord: @alex.ler'),
    ('22222222-2222-2222-2222-222222222222', 'profesor@ler.ro', 'prof123', 'Prof. Mihaela Ionescu', 'profesor', NULL, 'Catedra de Informatică LER', 'Teams: mihaela.ionescu@ler.ro'),
    ('33333333-3333-3333-3333-333333333333', 'admin@ler.ro', 'admin123', 'Administrator LER', 'admin', NULL, 'Coordonare Erasmus+ DIGI-EQUAL', 'admin@ler.ro')
ON CONFLICT (email) DO NOTHING;

-- Resurse inițiale
INSERT INTO resources (id, title, subject, grade, type, author_id, author_name, contact_handle, status, is_verified, verified_by, teacher_comment, description, content, link)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Ghid Metodic: Vectori în C++ și Optimizarea Parcurgerilor pentru BAC și OJI',
        'Informatica (C++)',
        'Clasa a IX-a',
        'Cod Sursă & Algoritmi',
        '11111111-1111-1111-1111-111111111111',
        'Andrei Popa (Clasa a XII-a A)',
        'Discord: @andrei.ler',
        'approved',
        TRUE,
        'Prof. Mihaela Ionescu (Catedra de Informatică LER)',
        'Cod optim conform standardelor C++, complexitate O(n), formulare didactică riguroasă pentru clasa a IX-a.',
        'Parcurgeri secvențiale, determinare minim/maxim și frecvență. Atenționări specifice privind indexarea de la 0 la n-1.',
        '#include <iostream>\nusing namespace std;\nint main() {\n    int n, v[1000];\n    cin >> n;\n    for(int i = 0; i < n; i++) cin >> v[i];\n    int maxVal = v[0], pozMax = 0;\n    for(int i = 1; i < n; i++) {\n        if(v[i] > maxVal) {\n            maxVal = v[i];\n            pozMax = i;\n        }\n    }\n    cout << "Maxim: " << maxVal << " la poz: " << pozMax;\n    return 0;\n}',
        'https://github.com/ler-edushare/cpp-vectori-demo'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Algoritmi Fundamentali de Sortare în Python: Bubble, Selection și QuickSort',
        'Python',
        'Clasa a X-a',
        'Cod Sursă & Algoritmi',
        '11111111-1111-1111-1111-111111111111',
        'Elena Dumitrescu (Clasa a XI-a B)',
        'Teams: elena.dumitrescu@ler.ro',
        'approved',
        FALSE,
        NULL,
        NULL,
        'Comparație algoritmică între metode O(n^2) și O(n log n). Implementare modulară în Python 3.',
        'def quick_sort(arr):\n    if len(arr) <= 1: return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    mid = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + mid + quick_sort(right)\n\nprint("Sortat:", quick_sort([64, 34, 25, 12, 22]))',
        'https://github.com/ler-edushare/python-sorting'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Ghid introductiv: Grafuri Neorientate și Algoritmul de Parcurgere BFS',
        'Informatica (C++)',
        'Clasa a XI-a',
        'Cod Sursă & Algoritmi',
        '11111111-1111-1111-1111-111111111111',
        'Ioana Stanciu (Clasa a XI-a A)',
        'Discord: @ioana.ler',
        'pending_admin',
        FALSE,
        NULL,
        NULL,
        'Construirea matricei de adiacență și explorarea pe niveluri utilizând coada STL.',
        '#include <iostream>\n#include <queue>\nusing namespace std;\nint n, m, a[100][100], viz[100];\n// Algoritm BFS in asteptare aprobare administrator',
        'https://github.com/ler-edushare/grafuri-bfs'
    )
ON CONFLICT (id) DO NOTHING;
