# 📧 Configurare Verificare Email - GRATUIT!

Ghid complet pentru activarea verificării prin email (alternativă gratuită la SMS).

---

## 🎯 De ce Email în loc de SMS?

### ✅ Avantaje Email:
- 💰 **COMPLET GRATUIT** - fără costuri per mesaj
- 🌍 **Universal** - toată lumea are email
- 📱 **Nu necesită telefon mobil** - funcționează pe orice dispozitiv
- 🔒 **Mai securizat** - codul ajunge direct în inbox
- 📊 **Ușor de monitorizat** - vezi cine a deschis emailul

### ❌ Dezavantaje SMS:
- 💸 Scump: ~0.35 RON per SMS
- 📱 Necesită telefon mobil
- 🚫 Poate fi blocat de operator
- 🐌 Uneori întârzie

---

## 🚀 Configurare în 3 Pași (5 minute)

### **Pasul 1: Creează App Password pentru Gmail**

1. Mergi la **[https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)**
2. Loghează-te cu contul tău Gmail
3. Dacă nu ai 2FA activat, activează-l mai întâi
4. La "Select app", alege **"Mail"**
5. La "Select device", alege **"Other"** și scrie "RATBV"
6. Click **"Generate"**
7. **Copiază parola generată** (16 caractere)

⚠️ **NOTĂ**: Aceasta NU este parola ta Gmail! Este o parolă specială pentru aplicații.

---

### **Pasul 2: Adaugă în fișierul `.env`**

Deschide fișierul `.env` și adaugă:

```env
# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM="RATBV Brașov" <your-email@gmail.com>
```

**Exemplu complet:**
```env
EMAIL_USER=ratbv.feedback@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM="RATBV Brașov" <ratbv.feedback@gmail.com>
```

⚠️ **IMPORTANT**: 
- Folosește **App Password** (nu parola normală Gmail)
- Fără spații în EMAIL_PASS (deși Gmail le afișează cu spații)
- EMAIL_FROM poate fi același cu EMAIL_USER

---

### **Pasul 3: Pornește serverul email**

```bash
# Terminal 1: Server Email
node server-email.js

# Terminal 2: Aplicația React
npm run dev
```

---

## 🧪 Testare

### Test 1: Verifică serverul
```bash
curl http://localhost:3001/api/health
```

Ar trebui să vezi:
```json
{
  "status": "ok",
  "email_enabled": true
}
```

### Test 2: Trimite email de test
```bash
node test-email.js test@example.com
```

### Test 3: Flux complet
1. Completează formularul până la email
2. Introdu adresa ta reală de email
3. Verifică inbox-ul (și Spam!)
4. Introdu codul de 6 cifre
5. Primești codul QR!

---

## 💰 Costuri

### **GRATUIT!** 🎉

- ✅ Gmail SMTP: **0 lei**
- ✅ Fără limitări stricte
- ✅ Până la ~500 email-uri/zi (limita Gmail)
- ✅ Perfect pentru volume mici-medii

### Comparație cu SMS:
| Serviciu | Cost per mesaj | 1000 utilizatori |
|----------|----------------|------------------|
| **Email** | **0 RON** | **0 RON** |
| SMS Twilio | 0.35 RON | 350 RON |
| SMS Vonage | 0.30 RON | 300 RON |

**Economii: 100% cu email!** 💰

---

## 📧 Template Email

Email-ul trimis arată profesional și include:

- ✅ Logo RATBV Brașov
- ✅ Cod OTP mare și vizibil
- ✅ Informații despre expirare
- ✅ Design responsive
- ✅ Versiune text pentru clienții fără HTML

**Exemplu subiect:** "Codul tău de verificare RATBV"

---

## 🔒 Securitate

### Protecții implementate:
- ✅ Cod OTP expiră după **10 minute** (mai mult decât SMS)
- ✅ Max **5 încercări** per cod (mai multe decât SMS)
- ✅ Max **10 email-uri** per adresă pe zi
- ✅ Rate limiting (1 email/minut)
- ✅ Coduri generate criptografic sigur
- ✅ Validare format email

### Best Practices:
- ⚠️ **NU** expune EMAIL_PASS în frontend
- ⚠️ Trimite email-urile doar din backend
- ⚠️ Folosește App Password (nu parola normală)
- ⚠️ Activează 2FA pe contul Gmail

---

## 🔍 Depanare

### ❌ "Eroare de autentificare"

**Cauze:**
1. **Parolă greșită**
   - Verifică că folosești **App Password** (nu parola Gmail)
   - Verifică că nu ai spații în parolă

2. **2FA nu este activat**
   - Mergi la https://myaccount.google.com/security
   - Activează "2-Step Verification"
   - Generează din nou App Password

3. **Contul nu permite accesul**
   - Mergi la https://myaccount.google.com/lesssecureapps
   - Asigură-te că accesul este permis

### ❌ "Nu primesc email-ul"

**Soluții:**
1. **Verifică folderul Spam**
2. **Așteaptă 1-2 minute** (email-ul poate întârzia)
3. **Verifică adresa** (să nu fie greșită)
4. **Verifică consola serverului** pentru erori

### ❌ "Rate limit exceeded"

**Soluție:**
- Așteaptă 1 minut între încercări
- Max 10 email-uri per adresă pe zi

---

## 🌐 Alternative la Gmail

### 1. Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```
Nodemailer va detecta automat serviciul.

### 2. Yahoo Mail
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### 3. SendGrid (Gratuit - 100 emailuri/zi)
```javascript
// Necesită modificare în lib/email.js
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### 4. Mailgun (Gratuit - 5000 emailuri/lună)
Similar cu SendGrid.

---

## 📊 Monitorizare

### Vezi email-urile trimise:
- Gmail: Trimite → Caută "RATBV"
- Console server: Vezi log-urile

### Statistici:
```javascript
// În lib/email.js, adaugă:
export function getEmailStats() {
  const today = new Date().toDateString();
  let count = 0;
  for (const [key] of otpStore.entries()) {
    if (key.includes(today)) count++;
  }
  return { sentToday: count };
}
```

---

## 🎨 Personalizare Email

Poți modifica template-ul HTML în `lib/email.js`:

```javascript
const mailOptions = {
  // ...
  html: `
    <!-- Modifică design-ul aici -->
    <div class="header">
      <h1>Logo-ul tău</h1>
    </div>
  `
};
```

---

## ✅ Checklist Final

- [ ] App Password Gmail generat
- [ ] Variabile adăugate în `.env`
- [ ] Server email pornit (`node server-email.js`)
- [ ] Test realizat cu succes
- [ ] Email primit în inbox
- [ ] Cod OTP verificat
- [ ] Flux complet funcțional

---

## 🎉 Felicitări!

Verificarea prin email este:
- ✅ **100% GRATUITĂ**
- ✅ **Universală**
- ✅ **Securizată**
- ✅ **Ușor de implementat**

**Economisești bani și oferi o experiență mai bună utilizatorilor!** 🚀

---

**Pentru detalii tehnice, vezi `lib/email.js` și `server-email.js`**
