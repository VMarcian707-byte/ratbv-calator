# 🚨 REZOLVARE: Nu se salvează și nu primesc email

Dacă nu se salvează nimic în baza de date și nu primești email, urmează acești pași **în ordine**:

---

## ⚡ SOLUȚIE RAPIDĂ (5 minute)

### Pasul 1: Configurează Supabase (2 minute)

1. **Deschide fișierul `.env`** (tocmai l-am creat)

2. **Mergi la Supabase:**
   - https://supabase.com
   - Selectează proiectul tău
   - Click pe **Settings** (⚙️) → **API**

3. **Copiază aceste 2 valori:**
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Înlocuiește în `.env`:**
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **Salvează fișierul**

---

### Pasul 2: Configurează Email (2 minute)

1. **Generează App Password Gmail:**
   - Mergi la: https://myaccount.google.com/apppasswords
   - Loghează-te cu Gmail
   - Selectează "Mail" → "Other" → scrie "RATBV"
   - Click "Generate"
   - **Copiază parola de 16 caractere** (fără spații!)

2. **Înlocuiește în `.env`:**
   ```env
   EMAIL_USER=ratbv.feedback@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   EMAIL_FROM="RATBV Brașov" <ratbv.feedback@gmail.com>
   ```

3. **Salvează fișierul**

---

### Pasul 3: Pornește Serverele (1 minut)

Deschide **2 terminale separate**:

**Terminal 1 - Server Email:**
```bash
node server-email.js
```

Ar trebui să vezi:
```
📧 RATBV Email Server pornit pe portul 3001
✅ Email: Configurat
```

**Terminal 2 - Aplicația React:**
```bash
npm run dev
```

Ar trebui să vezi:
```
VITE ready in 500 ms
➜  Local:   http://localhost:5173/
```

---

### Pasul 4: Testează

1. **Deschide browser-ul:** http://localhost:5173

2. **Completează formularul:**
   - Rating curățenie: 5 stele
   - Rating punctualitate: 5 stele
   - Feedback: "Test"
   - Email: `test@ratbv.ro` (sau email-ul tău real)

3. **Click "Trimite cod email"**

4. **Verifică inbox-ul** (și folderul Spam!)
   - Ar trebui să primești email cu cod de 6 cifre

5. **Introdu codul** în formular

6. **Verifică Supabase:**
   - Mergi la Supabase → Table Editor → responses
   - Ar trebui să vezi rândul nou!

---

## 🔍 DIAGNOSTICARE AUTOMATĂ

Am creat un script care verifică totul automat:

```bash
node diagnose.js
```

Acest script va:
- ✅ Verifica dacă `.env` este configurat corect
- ✅ Testa conexiunea la Supabase
- ✅ Testa conexiunea la email
- ✅ Verifica dacă serverele rulează
- ✅ Trimite un email de test

**Dacă sunt erori, scriptul îți spune exact ce trebuie să repari!**

---

## ❌ PROBLEME COMUNE

### Problema 1: "Nu se salvează în baza de date"

**Cauze posibile:**

1. **Fișierul `.env` nu este configurat**
   - Verifică că ai completat `VITE_SUPABASE_URL` și `VITE_SUPABASE_ANON_KEY`
   - Verifică că nu ai spații după `=`
   - Repornește `npm run dev` după modificare

2. **Tabela nu există în Supabase**
   - Mergi la Supabase → SQL Editor
   - Rulează `supabase/migrate-quick.sql`
   - Click "Run"

3. **Aplicația rulează în mod demo**
   - Dacă vezi badge-ul "DEMO" în header, înseamnă că Supabase nu este configurat
   - Configurează `.env` și repornește aplicația

**Soluție:**
```bash
# Verifică configurarea
node diagnose.js

# Dacă tabela nu există, rulează:
# Supabase → SQL Editor → supabase/migrate-quick.sql → Run
```

---

### Problema 2: "Nu primesc email"

**Cauze posibile:**

1. **Serverul de email nu rulează**
   - Verifică că ai pornit `node server-email.js`
   - Ar trebui să vezi mesajul de confirmare în terminal

2. **Credențiale email greșite**
   - Verifică `EMAIL_USER` și `EMAIL_PASS` în `.env`
   - Asigură-te că folosești **App Password** (nu parola normală Gmail)
   - Generează App Password la: https://myaccount.google.com/apppasswords

3. **2FA nu este activat pe Gmail**
   - Mergi la: https://myaccount.google.com/security
   - Activează "2-Step Verification"
   - Generează din nou App Password

4. **Email-ul ajunge în Spam**
   - Verifică folderul Spam/Junk
   - Adaugă expeditorul la contacts

5. **Limita Gmail depășită**
   - Gmail permite ~500 email-uri/zi
   - Așteaptă 24 de ore dacă ai depășit limita

**Soluție:**
```bash
# Testează email-ul
node diagnose.js

# Sau test direct:
node test-email.js test@ratbv.ro
```

---

### Problema 3: "Eroare de autentificare email"

**Soluție:**
1. Verifică că `EMAIL_PASS` este **App Password** (16 caractere, fără spații)
2. Generează din nou App Password la: https://myaccount.google.com/apppasswords
3. Asigură-te că 2FA este activat pe contul Gmail

---

### Problema 4: "Tabela responses nu există"

**Soluție:**
```sql
-- Rulează în Supabase SQL Editor:
-- Copiază TOT conținutul din supabase/migrate-quick.sql
-- Click "Run"
```

---

## 📋 CHECKLIST COMPLET

Bifează fiecare pas pe măsură ce îl completezi:

- [ ] Fișierul `.env` creat și completat
- [ ] `VITE_SUPABASE_URL` configurat
- [ ] `VITE_SUPABASE_ANON_KEY` configurat
- [ ] `EMAIL_USER` configurat
- [ ] `EMAIL_PASS` configurat (App Password)
- [ ] `EMAIL_FROM` configurat
- [ ] Tabela `responses` creată în Supabase
- [ ] Server email pornit (`node server-email.js`)
- [ ] Aplicația React pornită (`npm run dev`)
- [ ] Scriptul `diagnose.js` rulează fără erori
- [ ] Email de test primit
- [ ] Formular completat cu succes
- [ ] Date salvate în Supabase

---

## 🎯 FLUXUL CORECT

### Ce ar trebui să se întâmple:

1. **Utilizatorul completează formularul**
   - Rating curățenie
   - Rating punctualitate
   - Feedback text
   - Email

2. **Click "Trimite cod email"**
   - Aplicația trimite request la `http://localhost:3001/api/email/send`
   - Serverul generează cod OTP
   - Serverul trimite email prin Gmail SMTP
   - Utilizatorul primește email cu cod de 6 cifre

3. **Utilizatorul introduce codul**
   - Aplicația trimite request la `http://localhost:3001/api/email/verify`
   - Serverul verifică codul
   - Dacă e corect, aplicația continuă

4. **Se generează codul QR**
   - Aplicația generează ID unic (RATBV-XXXXX)
   - Aplicația trimite request la Supabase
   - Datele se salvează în tabela `responses`
   - Utilizatorul vede codul QR pe ecran

5. **Verificare în Supabase**
   - Mergi la Table Editor → responses
   - Ar trebui să vezi rândul nou cu email-ul tău

---

## 📞 DACĂ TOT NU FUNCȚIONEAZĂ

Rulează scriptul de diagnosticare:
```bash
node diagnose.js
```

Acest script îți va spune **exact** ce nu funcționează și cum să repari.

Dacă primești erori, copiază mesajul complet și verifică secțiunea "PROBLEME COMUNE" de mai sus.

---

## ✅ SUCCES!

Dacă totul funcționează corect:
- ✅ Primești email cu cod OTP
- ✅ Datele se salvează în Supabase
- ✅ Primești cod QR
- ✅ La ghișeu, se afișează email-ul tău

**Felicitări! 🎉 Sistemul funcționează perfect!**
