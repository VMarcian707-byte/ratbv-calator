# 📱 Configurare Verificare SMS cu Twilio

Ghid complet pentru adăugarea verificării prin SMS a numerelor de telefon.

---

## 🎯 Ce Face Verificarea SMS?

1. Călătorul introduce numărul de telefon
2. Primește un cod de 6 cifre prin SMS
3. Introduce codul în aplicație
4. Sistemul verifică și continuă cu generarea QR

**Beneficii:**
- ✅ Verifică că numărul este valid
- ✅ Verifică că utilizatorul are acces la telefon
- ✅ Previne numere false/inventate
- ✅ Crește încrederea în sistem

---

## 📋 Pasul 1: Creează Cont Twilio

1. Mergi la **[https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)**
2. Creează cont gratuit (nu necesită card)
3. Verifică email-ul

### Plan Gratuit Twilio:
- ✅ $15 credit gratuit (aproximativ 75 SMS-uri în România)
- ✅ Număr de telefon Twilio inclus
- ✅ Perfect pentru testare și volume mici

---

## 🔑 Pasul 2: Obține Credențialele Twilio

1. Loghează-te în **[Twilio Console](https://console.twilio.com)**
2. În dashboard, vei vedea:

### A) Account SID
```
ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
📋 Copiază acest ID

### B) Auth Token
```
your_auth_token_here
```
📋 Click pe ochi pentru a vedea și copiază token-ul

⚠️ **SECRET!** Nu partaja Auth Token-ul public!

### C) Cumpără un Număr de Telefon
1. Mergi la **Phone Numbers** → **Buy a number**
2. Selectează:
   - **Country**: Romania (+40)
   - **Capabilities**: SMS
3. Alege un număr și confirmă
4. Copiază numărul (ex: `+40712345678`)

---

## 📝 Pasul 3: Adaugă Variabilele de Mediu

Deschide fișierul `.env` și adaugă:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+40712345678
```

---

## 🚀 Pasul 4: Instalează Pachetele Necesare

```bash
npm install twilio
```

---

## 🎉 Pasul 5: Testează Configurația

```bash
node test-sms.js
```

Acest script va trimite un SMS de test la numărul tău.

---

## 💰 Costuri Twilio

### Pentru România:
- **SMS**: ~$0.075 per SMS (aproximativ 0.35 RON)
- **Număr telefon**: $1/lună

### Exemplu calcul:
- 1000 călători × 1 SMS fiecare = $75 (aproximativ 350 RON)
- 10,000 călători = $750 (aproximativ 3,500 RON)

### Sfaturi pentru reducerea costurilor:
1. **Verifică doar numerele mobile** (nu fixe)
2. **Folosește cache** pentru numere verificate recent
3. **Limitează încercările** (max 3 SMS-uri per număr pe zi)

---

## 🔐 Securitate

### Protecții implementate:
- ✅ Cod OTP expiră după 5 minute
- ✅ Max 3 încercări per cod
- ✅ Max 3 SMS-uri per număr pe zi
- ✅ Rate limiting (previne spam)
- ✅ Coduri generate criptografic sigur

### Best Practices:
- ⚠️ **NU** expune Auth Token-ul în frontend
- ⚠️ Trimite SMS-urile doar din backend
- ⚠️ Validează formatul telefonului înainte de trimitere
- ⚠️ Loghează toate încercările pentru audit

---

## 🧪 Testare

### Test 1: SMS de test
```bash
node test-sms.js
```

### Test 2: Flux complet
1. Completează formularul până la pasul telefon
2. Introdu numărul tău real
3. Ar trebui să primești SMS cu codul
4. Introdu codul în aplicație
5. Primești codul QR

### Test 3: Cod greșit
1. Introdu un cod greșit
2. Primești eroare: "Cod invalid"
3. Poți încerca de maxim 3 ori

### Test 4: Cod expirat
1. Așteaptă 5 minute
2. Încearcă să introduci codul
3. Primești: "Codul a expirat. Cere unul nou"

---

## 🔍 Depanare

### ❌ "Failed to send SMS"

**Cauze posibile:**
1. **Credențiale greșite**
   - Verifică Account SID și Auth Token
   - Verifică că nu ai spații suplimentare

2. **Număr Twilio necumpărat**
   - Mergi în Twilio Console → Phone Numbers
   - Cumpără un număr cu capabilitate SMS

3. **Număr destinatar invalid**
   - Verifică formatul: `+407XXXXXXXX`
   - Verifică că numărul poate primi SMS-uri

4. **Credit insuficient**
   - Mergi în Twilio Console → Billing
   - Adaugă credit dacă e necesar

### ❌ "Rate limit exceeded"

**Soluție:**
- Așteaptă 1 minut între încercări
- Max 3 SMS-uri per număr pe zi

---

## 🌐 Alternative la Twilio

### 1. Firebase Phone Authentication (Gratuit)
- ✅ 10,000 verificări/lună gratuite
- ✅ Integrare ușoară cu Firebase
- ❌ Necesită Firebase project
- ❌ Mai puțin control asupra mesajului

### 2. Vonage (fostul Nexmo)
- ✅ Prețuri similare cu Twilio
- ✅ API similar
- ❌ Documentație mai puțin prietenoasă

### 3. Servicii Românești
- **Netopia SMS**: ~0.05€ per SMS
- **iPay SMS**: Prețuri competitive
- ✅ Suport local
- ✅ Facturare în RON
- ❌ Integrare mai complexă

---

## 📊 Monitorizare

### Vezi SMS-urile trimise:
Twilio Console → Messaging → Logs

### Statistici:
```sql
-- Câte SMS-uri s-au trimis azi
SELECT COUNT(*) FROM otp_codes 
WHERE created_at >= CURRENT_DATE;

-- Rata de succes
SELECT 
  COUNT(*) FILTER (WHERE verified = true) as verified,
  COUNT(*) as total,
  ROUND(COUNT(*) FILTER (WHERE verified = true)::numeric / COUNT(*) * 100, 2) as success_rate
FROM otp_codes
WHERE created_at >= CURRENT_DATE;
```

---

## ✅ Checklist Final

- [ ] Cont Twilio creat
- [ ] Account SID copiat
- [ ] Auth Token copiat
- [ ] Număr Twilio cumpărat
- [ ] Variabile adăugate în `.env`
- [ ] Pachetul `twilio` instalat
- [ ] Script de test rulat cu succes
- [ ] SMS de test primit
- [ ] Flux complet testat în aplicație

---

**Felicitări! 🎉 Verificarea SMS este acum activă!**
