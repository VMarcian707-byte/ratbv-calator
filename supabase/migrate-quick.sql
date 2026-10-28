-- ============================================
-- MIGRARE RAPIDĂ: phone_number → email
-- Rulează acest script în Supabase SQL Editor
-- ============================================

-- PASUL 1: Șterge tabelul vechi (dacă există)
DROP TABLE IF EXISTS responses CASCADE;

-- PASUL 2: Creează tabelul nou cu email
CREATE TABLE responses (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    cleanliness_rating INT2 NOT NULL CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    punctuality_rating INT2 NOT NULL CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    feedback_text TEXT,
    qr_code_id TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REDEEMED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    redeemed_at TIMESTAMPTZ,
    cashier_id TEXT,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- PASUL 3: Creează indexuri
CREATE INDEX idx_responses_qr_code ON responses(qr_code_id);
CREATE INDEX idx_responses_email ON responses(email);
CREATE INDEX idx_responses_status ON responses(status);
CREATE INDEX idx_responses_created_at ON responses(created_at DESC);

-- PASUL 4: Activează RLS
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- PASUL 5: Creează politici
CREATE POLICY "Allow public insert" ON responses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public select" ON responses FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public update" ON responses FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- PASUL 6: Funcție pentru normalizare email
CREATE OR REPLACE FUNCTION normalize_email()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email := LOWER(TRIM(NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASUL 7: Trigger pentru normalizare
CREATE TRIGGER trigger_normalize_email
    BEFORE INSERT OR UPDATE ON responses
    FOR EACH ROW
    EXECUTE FUNCTION normalize_email();

-- PASUL 8: Testează cu o inserare
INSERT INTO responses (
    email, 
    cleanliness_rating, 
    punctuality_rating, 
    feedback_text, 
    qr_code_id,
    status
) VALUES (
    'test@ratbv.ro',
    5,
    4,
    'Test migrare reușită!',
    'RATBV-TEST1',
    'PENDING'
);

-- PASUL 9: Verifică inserarea
SELECT * FROM responses WHERE email = 'test@ratbv.ro';

-- PASUL 10: Curăță testul
DELETE FROM responses WHERE email = 'test@ratbv.ro';

-- ============================================
-- GATA! ✅ Tabelul este creat și funcțional
-- ============================================

-- Verifică structura finală:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'responses'
ORDER BY ordinal_position;
