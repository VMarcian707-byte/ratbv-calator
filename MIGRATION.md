# 🔄 Migrare de la Telefon la Email

Ghid pentru actualizarea bazei de date Supabase de la `phone_number` la `email`.

---

## ⚠️ IMPORTANT: Ce s-a schimbat?

### Schema nouă (Email):
```sql
CREATE TABLE responses (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,  -- ← SCHIMBAT din phone_number
    ...
);
```

### Ce trebuie să faci:
1. ✅ Ștergi tabelul vechi (dacă există)
2. ✅ Rulezi schema nouă
3. ✅ (Opțional) Migrezi datele existente

---

## 🚀 Opțiunea 1: Start Fresh (Recomandat pentru testare)

Dacă nu ai date importante, cel mai simplu este să ștergi totul și să începi de la zero:

### Pasul 1: Șterge tabelul vechi
Mergi în **Supabase → SQL Editor** și rulează:

```sql
-- Șterge tabelul vechi (dacă există)
DROP TABLE IF EXISTS responses CASCADE;
```

### Pasul 2: Rulează schema nouă
Copiază **TOT** conținutul din `supabase/schema.sql` și rulează-l în SQL Editor.

### Pasul 3: Verifică
```sql
-- Verifică structura tabelului
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'responses';
```

Ar trebui să vezi `email` în loc de `phone_number`.

---

## 🔄 Opțiunea 2: Migrare Date (Dacă ai date importante)

Dacă ai deja răspunsuri salvate cu `phone_number` și vrei să le păstrezi:

### Pasul 1: Backup (IMPORTANT!)
Înainte de orice modificare, fă un backup:

```sql
-- Exportă datele existente
SELECT * FROM responses;
```

Sau folosește Supabase Dashboard → Database → Backups

### Pasul 2: Adaugă coloana email temporar
```sql
-- Adaugă coloana email
ALTER TABLE responses ADD COLUMN email TEXT;
```

### Pasul 3: Migrează datele
Transformă numerele de telefon în email-uri (exemplu):

```sql
-- Exemplu: transformă 0750884666 în 0750884666@ratbv.local
UPDATE responses 
SET email = phone_number || '@ratbv.local'
WHERE email IS NULL;
```

**SAU** dacă ai email-uri reale:
```sql
-- Dacă ai o coloană cu email-uri reale
UPDATE responses 
SET email = 'user@example.com'  -- Înlocuiește cu logica ta
WHERE id = 1;  -- Pentru fiecare rând
```

### Pasul 4: Șterge constrângerile vechi
```sql
-- Șterge constrângerea de unicitate pe phone_number
ALTER TABLE responses DROP CONSTRAINT IF EXISTS responses_phone_number_key;

-- Șterge indexul vechi
DROP INDEX IF EXISTS idx_responses_phone;
```

### Pasul 5: Adaugă constrângerile noi
```sql
-- Adaugă constrângerea de unicitate pe email
ALTER TABLE responses ADD CONSTRAINT responses_email_key UNIQUE (email);

-- Adaugă validarea formatului email
ALTER TABLE responses ADD CONSTRAINT valid_email 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Adaugă index pentru email
CREATE INDEX idx_responses_email ON responses(email);
```

### Pasul 6: Șterge coloana veche
```sql
-- Șterge coloana phone_number
ALTER TABLE responses DROP COLUMN phone_number;
```

### Pasul 7: Verifică
```sql
-- Verifică structura finală
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'responses';
```

---

## 📋 Script Complet de Migrare

Dacă vrei să faci totul într-un singur script:

```sql
-- ============================================
-- MIGRARE COMPLETĂ: phone_number → email
-- ============================================

-- 1. Backup (opțional, dar recomandat)
-- CREATE TABLE responses_backup AS SELECT * FROM responses;

-- 2. Adaugă coloana email
ALTER TABLE responses ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Migrează datele (exemplu cu domeniu dummy)
UPDATE responses 
SET email = LOWER(phone_number || '@ratbv.local')
WHERE email IS NULL AND phone_number IS NOT NULL;

-- 4. Verifică că toate rândurile au email
SELECT COUNT(*) as rows_without_email 
FROM responses 
WHERE email IS NULL;
-- Ar trebui să fie 0

-- 5. Șterge constrângerile vechi
ALTER TABLE responses DROP CONSTRAINT IF EXISTS responses_phone_number_key;
DROP INDEX IF EXISTS idx_responses_phone;

-- 6. Adaugă constrângerile noi
ALTER TABLE responses ADD CONSTRAINT responses_email_key UNIQUE (email);
ALTER TABLE responses ADD CONSTRAINT valid_email 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
CREATE INDEX idx_responses_email ON responses(email);

-- 7. Șterge coloana veche
ALTER TABLE responses DROP COLUMN IF EXISTS phone_number;

-- 8. Verifică rezultatul
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'responses'
ORDER BY ordinal_position;

-- 9. Testează cu o inserare
INSERT INTO responses (
    email, 
    cleanliness_rating, 
    punctuality_rating, 
    feedback_text, 
    qr_code_id,
    status
) VALUES (
    'test@example.com',
    5,
    5,
    'Test migrare',
    'RATBV-TEST1',
    'PENDING'
);

-- 10. Verifică inserarea
SELECT * FROM responses WHERE email = 'test@example.com';

-- 11. Curăță testul
DELETE FROM responses WHERE email = 'test@example.com';
```

---

## 🧪 Testare după Migrare

### Test 1: Verifică structura
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'responses';
```

Ar trebui să vezi:
- ✅ `email` (text)
- ✅ `cleanliness_rating` (int2)
- ✅ `punctuality_rating` (int2)
- ✅ `feedback_text` (text)
- ✅ `qr_code_id` (text)
- ✅ `status` (text)
- ❌ `phone_number` (nu trebuie să existe)

### Test 2: Inserează un rând de test
```sql
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
    'Test după migrare',
    'RATBV-TEST2',
    'PENDING'
);
```

### Test 3: Verifică unicitatea
```sql
-- Încearcă să inserezi același email din nou
INSERT INTO responses (
    email, 
    cleanliness_rating, 
    punctuality_rating, 
    qr_code_id,
    status
) VALUES (
    'test@ratbv.ro',  -- ← același email
    3,
    3,
    'RATBV-TEST3',
    'PENDING'
);
```

Ar trebui să primești eroare: `duplicate key value violates unique constraint`

### Test 4: Curăță testele
```sql
DELETE FROM responses WHERE email LIKE '%test%';
```

---

## 🔄 Actualizare Aplicație

După migrarea bazei de date, aplicația este deja actualizată:

### ✅ Ce funcționează acum:
- Formularul colectează **email** (nu telefon)
- Validare format email
- Email trimis la Supabase ca `email` (nu `phone_number`)
- Ghișeul afișează **email** (nu telefon)
- LocalStorage folosește `email` (nu `phone_number`)

### 🧪 Testează fluxul complet:
1. Completează formularul cu un email
2. Primești cod OTP prin email
3. Verifici codul
4. Primești codul QR
5. La ghișeu, se afișează email-ul

---

## 📊 Statistici după Migrare

```sql
-- Total răspunsuri
SELECT COUNT(*) FROM responses;

-- Răspunsuri pe status
SELECT status, COUNT(*) FROM responses GROUP BY status;

-- Rating mediu
SELECT 
    AVG(cleanliness_rating) as avg_cleanliness,
    AVG(punctuality_rating) as avg_punctuality
FROM responses;

-- Răspunsuri pe zi
SELECT 
    DATE(created_at) as date,
    COUNT(*) as count
FROM responses
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## ⚠️ Probleme Comune

### ❌ "column email does not exist"
**Soluție:** Nu ai rulat schema nouă. Rulează `supabase/schema.sql`.

### ❌ "duplicate key value violates unique constraint"
**Soluție:** Email-ul există deja. Folosește alt email sau șterge rândul vechi.

### ❌ "invalid input syntax for type email"
**Soluție:** Formatul email-ului este invalid. Verifică constrângerea `valid_email`.

### ❌ Datele migrate au email-uri ciudate (ex: `0750884666@ratbv.local`)
**Soluție:** Este normal dacă ai folosit scriptul de migrare cu domeniu dummy. Poți:
1. Șterge datele vechi și începe de la zero
2. Actualizează manual email-urile cu valori reale
3. Trimite email-uri de re-verificare utilizatorilor

---

## ✅ Checklist Final

- [ ] Tabelul vechi șters SAU date migrate
- [ ] Schema nouă rulată cu succes
- [ ] Coloana `email` există
- [ ] Coloana `phone_number` nu mai există
- [ ] Constrângerea de unicitate pe `email` funcționează
- [ ] Validarea formatului email funcționează
- [ ] Test de inserare reușit
- [ ] Aplicația funcționează cu email
- [ ] Flux complet testat (formular → email → QR → ghișeu)

---

**Felicitări! 🎉 Baza de date este acum actualizată pentru email!**
