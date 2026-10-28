# 🔄 Ghid Rapid: Migrare Telefon → Email

Schema bazei de date a fost actualizată pentru a folosi **email** în loc de **telefon**.

---

## ⚡ Ce trebuie să faci (2 minute)

### Pasul 1: Deschide Supabase SQL Editor
1. Mergi la https://supabase.com
2. Selectează proiectul tău
3. Click pe **SQL Editor** (meniul din stânga)

### Pasul 2: Rulează scriptul de migrare
1. Click pe **"New query"**
2. Copiază **TOT** conținutul din `supabase/migrate-quick.sql`
3. Lipește-l în editor
4. Click pe **"Run"** (sau Ctrl+Enter)

### Pasul 3: Verifică
Ar trebui să vezi:
```
Success. No rows returned
```

✅ **GATA!** Baza de date este actualizată!

---

## 📋 Ce s-a schimbat?

### Schema VECHIE (telefon):
```sql
CREATE TABLE responses (
    phone_number TEXT UNIQUE NOT NULL,  -- ❌ VECHI
    ...
);
```

### Schema NOUĂ (email):
```sql
CREATE TABLE responses (
    email TEXT UNIQUE NOT NULL,  -- ✅ NOU
    ...
);
```

---

## 🧪 Testează

### Test 1: Verifică structura
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'responses';
```

Ar trebui să vezi `email` în loc de `phone_number`.

### Test 2: Completează formularul
1. Deschide aplicația: http://localhost:5173
2. Completează formularul până la email
3. Introdu un email (ex: `test@ratbv.ro`)
4. Primești cod OTP prin email
5. Verifici codul
6. Primești codul QR

### Test 3: Verifică în Supabase
1. Mergi la **Table Editor** → **responses**
2. Ar trebui să vezi rândul nou cu `email` (nu `phone_number`)

---

## 📁 Fișiere Actualizate

### ✅ Bază de date:
- `supabase/schema.sql` - Schema completă cu email
- `supabase/migrate-quick.sql` - Script rapid de migrare

### ✅ Aplicație:
- `src/lib/supabase.ts` - Funcții actualizate pentru email
- `src/pages/TravelerForm.tsx` - Formular cu email
- `src/pages/CashierPage.tsx` - Ghișeu afișează email

---

## 🎯 Fluxul Nou

### Călătorul:
1. Completează feedback
2. Introdu **email** (nu telefon)
3. Primește **email** cu cod OTP
4. Verifică codul
5. Primește cod QR

### Ghișeul:
1. Scanează cod QR
2. Vezi **email-ul** călătorului (nu telefonul)
3. Validează și acordă 3 bilete

---

## ⚠️ Important

### Dacă ai date vechi cu telefon:
- **Opțiunea 1** (recomandat): Șterge totul și începe de la zero
  - Rulează `supabase/migrate-quick.sql`
  
- **Opțiunea 2**: Migrează datele
  - Vezi `MIGRATION.md` pentru scripturi detaliate

### Dacă nu ai date importante:
- Rulează direct `supabase/migrate-quick.sql`
- Gata! ✅

---

## 📖 Documentație Completă

- **`MIGRATION.md`** - Ghid detaliat de migrare
- **`supabase/schema.sql`** - Schema completă
- **`supabase/migrate-quick.sql`** - Script rapid

---

## ✅ Checklist

- [ ] Script de migrare rulat în Supabase
- [ ] Structura tabelului verificată
- [ ] Formularul funcționează cu email
- [ ] Email OTP trimis și verificat
- [ ] Cod QR generat
- [ ] Ghișeul afișează email
- [ ] Date salvate corect în Supabase

---

**Gata! 🎉 Aplicația folosește acum email în loc de telefon!**
