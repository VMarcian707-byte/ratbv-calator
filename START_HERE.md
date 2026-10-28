# 🚀 START AICI - Configurare Completă (5 minute)

Urmează acești pași **exact** și în **ordine**. Nu sări peste niciun pas!

---

## 📋 CE TREBUIE SĂ FACI

### ⏱️ Timp necesar: 5 minute
### 📁 Fișiere de editat: 1 (`.env`)
### 🔑 Conturi necesare: Supabase + Gmail

---

## PASUL 1: Supabase (2 minute)

### 1.1 Deschide Supabase
🌐 Mergi la: **https://supabase.com**

### 1.2 Selectează proiectul tău
- Dacă ai deja un proiect, click pe el
- Dacă nu, click "New Project" și creează unul

### 1.3 Găsește credențialele API
- Click pe **Settings** (⚙️) în meniul din stânga
- Click pe **API**
- Derulează până la **"Project API keys"**

### 1.4 Copiază aceste 2 valori:

```
📋 Project URL:
https://abcdefg.supabase.co

📋 anon public key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIs...
```

### 1.5 Deschide fișierul `.env`
- Găsește fișierul `.env` în folderul proiectului
- Deschide-l cu Notepad, VS Code, sau orice editor text

### 1.6 Înlocuiește aceste linii:

**Găsește:**
```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Înlocuiește cu:**
```env
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANT:** Folosește valorile tale, nu exemplul!

### 1.7 Salvează fișierul `.env`

---

## PASUL 2: Email (2 minute)

### 2.1 Generează App Password Gmail
🌐 Mergi la: **https://myaccount.google.com/apppasswords**

### 2.2 Loghează-te cu contul tău Gmail

### 2.3 Generează parola
- La "Select app", alege **Mail**
- La "Select device", alege **Other**
- Scrie: **RATBV**
- Click **Generate**

### 2.4 Copiază parola generată
- Vei vedea o parolă de 16 caractere (ex: `abcd efgh ijkl mnop`)
- **Copiaz-o FĂRĂ spații** (ex: `abcdefghijklmnop`)

### 2.5 Deschide fișierul `.env` (dacă nu e deja deschis)

### 2.6 Înlocuiește aceste linii:

**Găsește:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM="RATBV Brașov" <your-email@gmail.com>
```

**Înlocuiește cu:**
```env
EMAIL_USER=ratbv.feedback@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM="RATBV Brașov" <ratbv.feedback@gmail.com>
```

⚠️ **IMPORTANT:** 
- `EMAIL_PASS` = App Password (16 caractere, **fără spații**)
- `EMAIL_USER` = adresa ta Gmail
- `EMAIL_FROM` = același email

### 2.7 Salvează fișierul `.env`

---

## PASUL 3: Pornește Serverele (1 minut)

### 3.1 Deschide Terminal 1 (Server Email)

```bash
node server-email.js
```

**Ar trebui să vezi:**
```
📧 RATBV Email Server pornit pe portul 3001
📡 Endpoint-uri disponibile:
   POST /api/email/send    - Trimite email cu cod OTP
   POST /api/email/verify  - Verifică cod OTP
   GET  /api/health        - Verificare stare server

🔧 Mod: development
📧 Email: ✅ Configurat
```

✅ Dacă vezi acest mesaj, serverul funcționează!

### 3.2 Deschide Terminal 2 (Aplicația React)

**Deschide un NOU terminal** (nu închide primul!)

```bash
npm run dev
```

**Ar trebui să vezi:**
```
VITE ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ Dacă vezi acest mesaj, aplicația funcționează!

---

## PASUL 4: Testează (1 minut)

### 4.1 Deschide browser-ul
🌐 Mergi la: **http://localhost:5173**

### 4.2 Completează formularul
- Rating curățenie: ⭐⭐⭐⭐⭐ (5 stele)
- Rating punctualitate: ⭐⭐⭐⭐⭐ (5 stele)
- Feedback: "Test"
- Email: `test@ratbv.ro` (sau email-ul tău real)

### 4.3 Click "Trimite cod email"

### 4.4 Verifică inbox-ul
- Deschide email-ul tău
- Verifică și folderul **Spam/Junk**
- Ar trebui să primești email cu subiectul: **"Codul tău de verificare RATBV"**
- Email-ul conține un cod de 6 cifre (ex: `123456`)

### 4.5 Introdu codul în formular
- Copiază codul din email
- Lipește-l în câmpul de verificare
- Click "Verifică cod"

### 4.6 Verifică codul QR
- Ar trebui să vezi un cod QR mare pe ecran
- Codul are formatul: `RATBV-XXXXX`

### 4.7 Verifică în Supabase
- Mergi la Supabase
- Click pe **Table Editor** (meniul din stânga)
- Click pe tabela **responses**
- Ar trebui să vezi rândul nou cu email-ul tău!

---

## ✅ SUCCES!

Dacă ai ajuns până aici și totul funcționează:
- ✅ Primești email cu cod OTP
- ✅ Datele se salvează în Supabase
- ✅ Primești cod QR

**Felicitări! 🎉 Sistemul funcționează perfect!**

---

## ❌ DACĂ CEVA NU FUNCȚIONEAZĂ

### Problema 1: Nu primesc email

**Verifică:**
1. Serverul email rulează? (`node server-email.js`)
2. `EMAIL_PASS` este App Password (nu parola normală)?
3. Verifică folderul Spam

**Testează:**
```bash
node diagnose.js
```

### Problema 2: Nu se salvează în Supabase

**Verifică:**
1. `VITE_SUPABASE_URL` și `VITE_SUPABASE_ANON_KEY` sunt configurate?
2. Tabela `responses` există? (Rulează `supabase/migrate-quick.sql`)
3. Ai repornit `npm run dev` după modificare `.env`?

**Testează:**
```bash
node diagnose.js
```

### Problema 3: Eroare de autentificare email

**Soluție:**
1. Verifică că `EMAIL_PASS` este App Password (16 caractere, fără spații)
2. Generează din nou App Password la: https://myaccount.google.com/apppasswords
3. Asigură-te că 2FA este activat pe Gmail

---

## 📞 AJUTOR SUPLIMENTAR

Dacă tot nu funcționează:

1. **Rulează diagnosticarea:**
   ```bash
   node diagnose.js
   ```

2. **Verifică log-urile:**
   - Terminal 1 (server email): vezi erorile
   - Terminal 2 (aplicație): vezi erorile
   - Browser (F12 → Console): vezi erorile

3. **Citește documentația detaliată:**
   - `FIX_ISSUES.md` - Rezolvare probleme comune
   - `EMAIL_SETUP.md` - Configurare email detaliată
   - `SETUP.md` - Configurare Supabase detaliată

---

## 🎯 REZUMAT RAPID

```bash
# 1. Editează .env (configurații Supabase + Email)
# 2. Pornește server email:
node server-email.js

# 3. Pornește aplicația (în alt terminal):
npm run dev

# 4. Testează:
node diagnose.js

# 5. Deschide browser:
http://localhost:5173
```

---

**Gata! 🚀 Acum poți folosi aplicația RATBV Brașov!**
