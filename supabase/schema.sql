-- ============================================
-- RATBV Brașov - Schema Bază de Date
-- Feedback Collection & Prize Management
-- Versiune cu Email (în loc de telefon)
-- ============================================

-- Tabelul principal pentru răspunsuri și coduri QR
CREATE TABLE IF NOT EXISTS responses (
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
    -- Validare format email
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index pentru căutări rapide după QR code
CREATE INDEX IF NOT EXISTS idx_responses_qr_code ON responses(qr_code_id);

-- Index pentru email (căutări și validări)
CREATE INDEX IF NOT EXISTS idx_responses_email ON responses(email);

-- Index pentru status (pentru filtrarea codurilor neutilizate)
CREATE INDEX IF NOT EXISTS idx_responses_status ON responses(status);

-- Index pentru data creării
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at DESC);

-- Comentarii pentru documentație
COMMENT ON TABLE responses IS 'Răspunsuri feedback RATBV cu coduri QR pentru recompense (verificare prin email)';
COMMENT ON COLUMN responses.email IS 'Email unic - previne duplicatele și permite verificare OTP';
COMMENT ON COLUMN responses.qr_code_id IS 'ID unic format RATBV-XXXXX codificat în QR';
COMMENT ON COLUMN responses.status IS 'PENDING = nerevendicat, REDEEMED = revendicat la ghișeu';
COMMENT ON COLUMN responses.redeemed_at IS 'Data și ora revendicării premiului';
COMMENT ON COLUMN responses.cashier_id IS 'ID-ul ghișeului care a validat codul';

-- ============================================
-- REGULI DE SECURITATE SUPABASE (RLS)
-- ============================================

-- Activare Row Level Security
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Politică: Permitere insert public (orice călător poate trimite feedback)
CREATE POLICY "Allow public insert" ON responses
    FOR INSERT TO anon
    WITH CHECK (true);

-- Politică: Permitere select public pentru validare QR (ghișeu)
CREATE POLICY "Allow public select" ON responses
    FOR SELECT TO anon
    USING (true);

-- Politică: Permitere update pentru validare (schimbare status în REDEEMED)
CREATE POLICY "Allow public update" ON responses
    FOR UPDATE TO anon
    USING (true)
    WITH CHECK (true);

-- ============================================
-- FUNCȚII UTILITARE (opțional)
-- ============================================

-- Funcție pentru a normaliza email-ul (lowercase, trim)
CREATE OR REPLACE FUNCTION normalize_email()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email := LOWER(TRIM(NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pentru normalizare automată
CREATE TRIGGER trigger_normalize_email
    BEFORE INSERT OR UPDATE ON responses
    FOR EACH ROW
    EXECUTE FUNCTION normalize_email();

-- ============================================
-- STATISTICI ȘI RAPORTARE (opțional)
-- ============================================

-- View pentru statistici rapide
CREATE OR REPLACE VIEW response_stats AS
SELECT 
    COUNT(*) as total_responses,
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count,
    COUNT(*) FILTER (WHERE status = 'REDEEMED') as redeemed_count,
    AVG(cleanliness_rating) as avg_cleanliness,
    AVG(punctuality_rating) as avg_punctuality,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_count
FROM responses;

-- ============================================
-- MIGRARE DE LA TELEFON LA EMAIL (dacă e necesar)
-- ============================================

-- Dacă ai deja date cu phone_number, rulează acest script:
/*
-- 1. Adaugă coloana email temporar
ALTER TABLE responses ADD COLUMN email_temp TEXT;

-- 2. Migrează datele (exemplu: transformă telefonul în email dummy)
UPDATE responses 
SET email_temp = phone_number || '@ratbv.local'
WHERE email IS NULL;

-- 3. Șterge constrângerea veche
ALTER TABLE responses DROP CONSTRAINT IF EXISTS responses_phone_number_key;

-- 4. Adaugă constrângerea nouă
ALTER TABLE responses ADD CONSTRAINT responses_email_key UNIQUE (email_temp);

-- 5. Redenumește coloana
ALTER TABLE responses RENAME COLUMN email_temp TO email;

-- 6. Șterge coloana veche
ALTER TABLE responses DROP COLUMN IF EXISTS phone_number;
*/
