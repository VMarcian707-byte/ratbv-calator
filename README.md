# RATBV Brașov - Sistem de Feedback & Recompense

Aplicație web completă pentru colectarea feedback-ului de la călătorii RATBV Brașov și gestionarea premiilor fizice (3 călătorii gratuite) prin coduri QR unice.

## 🎯 Funcționalități

### Pentru Călători (`/`)
- Formular multi-step pentru feedback:
  1. Rating curățenie (1-5 stele)
  2. Rating punctualitate (1-5 stele)
  3. Comentarii opționale
  4. Număr de telefon (validare românească)
- Generare automată cod QR unic (format: `RATBV-XXXXX`)
- Afișare cod QR pe ecran cu opțiune de download
- **NU se trimit SMS-uri** - codul apare direct pe ecran!

### Pentru Ghișeu (`/cashier`)
- Scanner video QR prin camera dispozitivului
- Input manual fallback pentru tastare cod
- Validare instantanee cu feedback vizual colorat:
  - ✅ **VERDE**: Cod valid - se acordă 3 bilete
  - ⚠️ **PORTOCALIU**: Cod deja folosit
  - ❌ **ROȘU**: Cod invalid
- Resetare automată după 3 secunde

## 🚀 Moduri de Funcționare

### 1. Mod Demo (Implicit)
Aplicația funcționează **fără configurare** folosind `localStorage` pentru stocare.
- Ideal pentru testare și demonstrații
- Datele sunt stocate local în browser
- Nu necesită bază de date

### 2. Mod Producție (Supabase)
Pentru producție, configurați Supabase:

#### Pași de configurare:

1. **Creați proiect Supabase** la https://supabase.com

2. **Rulați schema SQL** din `supabase/schema.sql` în editorul SQL Supabase

3. **Creați fișier `.env`** în rădăcina proiectului:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Reporniți serverul de dezvoltare**:
```bash
npm run dev
```

## 📱 Cum Funcționează (Flux Complet)

### Călătorul:
1. Completează formularul de feedback
2. Introduce numărul de telefon (pentru a preveni duplicate)
3. La submit, primește **imediat** un cod QR pe ecran
4. Face screenshot la codul QR
5. Prezintă codul la ghișeul RATBV

### Ghișeul:
1. Scanează codul QR de pe telefonul călătorului
2. Sistemul verifică automat:
   - Dacă codul există în baza de date
   - Dacă nu a fost deja folosit
3. Dacă e valid → afișare ecran VERDE "DĂ 3 BILETE"
4. Dacă e invalid/deja folosit → afișare ecran ROȘU/PORTOCALIU

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Animații**: Framer Motion
- **Routing**: React Router DOM
- **QR Code**: 
  - Generare: `qrcode.react`
  - Scanare: `html5-qrcode`
- **Database**: Supabase (PostgreSQL) - opțional
- **Icons**: Lucide React

## 📂 Structura Proiectului

```
src/
├── App.tsx                    # Router principal
├── main.tsx                   # Entry point
├── index.css                  # Stiluri globale + Tailwind
├── vite-env.d.ts              # Tipuri TypeScript pentru Vite
├── lib/
│   └── supabase.ts            # Client Supabase + funcții CRUD + mod demo
└── pages/
    ├── TravelerForm.tsx       # Formular feedback călători
    └── CashierPage.tsx        # Interfață ghișeu cu scanner QR

supabase/
└── schema.sql                 # Schema bazei de date PostgreSQL
```

## 🔒 Securitate & Anti-Fraudă

### Validări implementate:
- ✅ Număr de telefon unic (constraint UNIQUE în DB)
- ✅ Cod QR unic (constraint UNIQUE în DB)
- ✅ Validare format telefon românesc
- ✅ Status tracking (PENDING/REDEEMED)
- ✅ Timestamp revendicare (redeemed_at)
- ✅ Row Level Security (RLS) în Supabase

### Protecții:
- Un număr de telefon poate primi o singură recompensă
- Un cod QR poate fi folosit o singură dată
- Sistemul previne dubla revendicare

## 🎨 Design

- **Mobile-first**: Optimizat pentru telefoane
- **Modern**: Gradient-uri, animații fluide, feedback vizual
- **Accesibil**: Contraste bune, butoane mari, text clar
- **Responsive**: Funcționează pe orice dimensiune de ecran

## 🚀 Deployment

### Build pentru producție:
```bash
npm run build
```

Fișierele optimizate vor fi în folderul `dist/`

### Deploy pe Vercel/Netlify:
1. Push codul pe GitHub
2. Conectează repository-ul la Vercel/Netlify
3. Adaugă variabilele de mediu (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
4. Deploy automat la fiecare push

## 📝 Note Importante

### Despre SMS-uri:
⚠️ **Aplicația NU trimite SMS-uri!** 

Codul QR este afișat **imediat pe ecran** după trimiterea formularului. Călătorul trebuie să facă screenshot sau să salveze codul pentru a-l prezenta la ghișeu.

Dacă doriți funcționalitate SMS, aveți nevoie de:
- Serviciu SMS (Twilio, Vonage, etc.)
- Backend server pentru trimitere SMS
- Costuri per SMS trimis

### Mod Demo vs Producție:
- **Demo**: Datele se pierd la ștergerea cache-ului browserului
- **Producție**: Datele persistă în Supabase (PostgreSQL)

## 🤝 Contribuții

Pentru îmbunătățiri sau bug-uri, creați un issue sau pull request.

## 📄 Licență

© 2024 RATBV Brașov - Toate drepturile rezervate

---

**Creat cu ❤️ pentru transportul public din Brașov**
