# 🚀 Ghid Complet: Configurare Bază de Date Supabase

Acest ghid te ajută să configurezi baza de date Supabase pentru aplicația RATBV Brașov.

---

## 📋 Pasul 1: Creează Cont Supabase

1. Mergi la **[https://supabase.com](https://supabase.com)**
2. Click pe **"Start your project"**
3. Autentifică-te cu GitHub (recomandat) sau email

---

## 🏗️ Pasul 2: Creează Proiect Nou

1. Click pe **"New Project"**
2. Completează:
   - **Name**: `ratbv-feedback` (sau orice nume preferi)
   - **Database Password**: Alege o parolă puternică (salveaz-o!)
   - **Region**: Alege cea mai apropiată locație (ex: Frankfurt pentru România)
   - **Pricing Plan**: Free (suficient pentru început)

3. Click **"Create new project"**
4. ⏳ Așteaptă ~2 minute până se inițializează

---

## 🗄️ Pasul 3: Rulează Schema SQL

1. În dashboard-ul Supabase, click pe **"SQL Editor"** (iconița din meniul stânga)
2. Click pe **"New query"**
3. Copiază **TOT** conținutul din fișierul `supabase/schema.sql`
4. Lipește-l în editor
5. Click pe **"Run"** (sau Ctrl+Enter)

Ar trebui să vezi:
```
Success. No rows returned
```

✅ **Tabelul `responses` a fost creat cu succes!**

---

## 🔑 Pasul 4: Obține Credențialele API

1. Click pe **"Settings"** (iconița ⚙️ din meniul stânga)
2. Click pe **"API"**
3. Vei vedea secțiunea **"Project API keys"**

### Copiază aceste 2 valori:

#### A) Project URL
```
https://abcdefg.supabase.co
```
📋 Copiază acest URL complet

#### B) anon public key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
📋 Copiază cheia completă (este lungă)

⚠️ **NOTĂ**: `anon public` este sigură pentru frontend (este publică prin design)

---

## 📝 Pasul 5: Creează Fișierul .env

1. În folderul rădăcină al proiectului, creează un fișier numit **`.env`** (fără extensie)
2. Adaugă următorul conținut:

```env
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Înlocuiește valorile cu cele copiate de la Pasul 4

### Exemplu complet:
```env
VITE_SUPABASE_URL=https://xyzabcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.SIGNATURE
```

---

## 🔄 Pasul 6: Repornește Aplicația

```bash
# Oprește serverul (Ctrl+C)
# Apoi repornește:
npm run dev
```

✅ Acum aplicația va folosi **Supabase** în loc de localStorage!

---

## ✅ Pasul 7: Verifică Configurația

1. Deschide aplicația: `http://localhost:5173`
2. Badge-ul **"DEMO"** ar trebui să **DISPARĂ** din header
3. Completează formularul și trimite
4. Mergi în Supabase → **"Table Editor"** → click pe tabelul **"responses"**
5. Ar trebui să vezi rândul nou creat! 🎉

---

## 🧪 Testare Completă

### Test 1: Creare răspuns nou
1. Completează formularul cu telefon: `0750884666`
2. Primești cod QR (ex: `RATBV-ABC12`)
3. Verifică în Supabase → Table Editor → responses
4. Ar trebui să vezi:
   - `phone_number`: `0750884666`
   - `qr_code_id`: `RATBV-ABC12`
   - `status`: `PENDING`

### Test 2: Validare la ghișeu
1. Mergi la `/cashier`
2. Scanează codul QR sau tastează manual: `RATBV-ABC12`
3. Ecranul devine **VERDE**: "✅ VALID! DĂ 3 BILETE"
4. Verifică în Supabase:
   - `status`: `REDEEMED`
   - `redeemed_at`: timestamp curent

### Test 3: Cod deja folosit
1. Scanează același cod din nou
2. Ecranul devine **PORTOCALIU**: "⚠️ COD DEJA FOLOSIT"

### Test 4: Număr duplicat
1. Încearcă să trimiți din nou cu același telefon: `0750884666`
2. Primești eroare: "Acest număr de telefon a fost deja folosit pentru o recompensă!"

---

## 🔍 Depanare (Troubleshooting)

### ❌ Eroare: "A apărut o eroare. Încercați din nou."

**Cauze posibile:**
1. **Fișier .env lipsă sau greșit**
   - Verifică că fișierul se numește exact `.env` (nu `.env.txt`)
   - Verifică că nu ai spații după `=`
   - Verifică că ai repornit `npm run dev` după creare

2. **Credențiale incorecte**
   - Verifică că `VITE_SUPABASE_URL` nu are `/` la final
   - Verifică că `VITE_SUPABASE_ANON_KEY` este completă

3. **Schema SQL nu a fost rulată**
   - Mergi în Supabase → SQL Editor
   - Rulează din nou `supabase/schema.sql`

### ❌ Badge-ul "DEMO" nu dispare

**Soluție:**
- Șterge cache-ul browserului (Ctrl+Shift+R)
- Verifică că fișierul `.env` este în folderul rădăcină (nu în `src/`)
- Repornește serverul: `npm run dev`

### ❌ "relation responses does not exist"

**Soluție:**
- Schema SQL nu a fost rulată
- Mergi în Supabase → SQL Editor
- Rulează `supabase/schema.sql`

---

## 🌐 Deploy pe Producție

### Opțiunea 1: Vercel (Recomandat)

1. Push codul pe GitHub
2. Mergi la [https://vercel.com](https://vercel.com)
3. Import repository-ul
4. Adaugă variabilele de mediu:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **"Deploy"**

### Opțiunea 2: Netlify

1. Push codul pe GitHub
2. Mergi la [https://netlify.com](https://netlify.com)
3. Connect to Git → select repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Adaugă variabilele de mediu în Site settings
7. Deploy

### Opțiunea 3: Build Manual

```bash
npm run build
```

Copiază folderul `dist/` pe serverul tău web.

---

## 🔐 Securitate Supabase

### Row Level Security (RLS)

Schema SQL include deja politici RLS care permit:
- ✅ Insert public (orice călător poate trimite feedback)
- ✅ Select public (pentru validare QR la ghișeu)
- ✅ Update public (pentru schimbare status în REDEEMED)

### Chei API

- **anon key**: Sigură pentru frontend (este publică)
- **service_role key**: ⚠️ SECRETĂ! Nu o folosi niciodată în frontend!

---

## 📊 Monitorizare & Statistici

### Vezi toate răspunsurile:
Supabase → Table Editor → responses

### Statistici rapide:
```sql
-- Total răspunsuri
SELECT COUNT(*) FROM responses;

-- Răspunsuri revendicate vs nerevendicate
SELECT status, COUNT(*) FROM responses GROUP BY status;

-- Rating mediu curățenie
SELECT AVG(cleanliness_rating) FROM responses;

-- Rating mediu punctualitate
SELECT AVG(punctuality_rating) FROM responses;
```

---

## 💰 Costuri Supabase

### Plan Gratuit (Free Tier):
- ✅ 500 MB stocare database
- ✅ 1 GB stocare fișiere
- ✅ 50,000 utilizatori activi lunar
- ✅ 500 MB transfer lunar
- ✅ 2 proiecte gratuite

**Suficient pentru:** ~10,000 răspunsuri feedback

### Plan Pro ($25/lună):
- ✅ 8 GB stocare database
- ✅ 100 GB transfer lunar
- ✅ Backup-uri zilnice
- ✅ Fără limită de proiecte

---

## 📞 Suport

Dacă întâmpini probleme:
1. Verifică secțiunea "Depanare" de mai sus
2. Verifică console-ul browserului (F12) pentru erori
3. Verifică logs în Supabase → Logs

---

## ✅ Checklist Final

- [ ] Cont Supabase creat
- [ ] Proiect nou creat
- [ ] Schema SQL rulată cu succes
- [ ] Credențiale copiate (URL + anon key)
- [ ] Fișier `.env` creat cu valorile corecte
- [ ] Aplicația repornită (`npm run dev`)
- [ ] Badge "DEMO" a dispărut
- [ ] Test complet realizat (formular + ghișeu)
- [ ] Datele apar în Supabase Table Editor

---

**Felicitări! 🎉 Aplicația ta RATBV este acum în producție!**
