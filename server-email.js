/**
 * RATBV Brașov - Server Backend pentru Email
 * 
 * Server Express care gestionează:
 * - Trimiterea email-urilor cu cod OTP prin Nodemailer
 * - Verificarea codurilor OTP
 * - Rate limiting și securitate
 * 
 * GRATUIT! Fără costuri (folosește Gmail SMTP)
 * 
 * Rulează cu: node server-email.js
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendOTP, verifyOTP, cleanupExpiredOTPs } from './lib/email.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Cleanup periodic pentru OTP-uri expirate (la fiecare 10 minute)
setInterval(cleanupExpiredOTPs, 10 * 60 * 1000);

// ============================================
// RUTE API
// ============================================

/**
 * POST /api/email/send
 * Trimite email cu cod OTP la adresa specificată
 * 
 * Body: { email: "user@example.com" }
 * Response: { success: true, message: "Cod trimis" }
 */
app.post('/api/email/send', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validare input
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Adresa de email este obligatorie' 
      });
    }
    
    // Trimite email
    const result = await sendOTP(email);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Codul de verificare a fost trimis prin email',
        // În producție, NU trimite codul înapoi!
        // Doar pentru testare:
        ...(process.env.NODE_ENV !== 'production' && { testCode: result.code })
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error 
      });
    }
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Eroare la trimiterea email-ului' 
    });
  }
});

/**
 * POST /api/email/verify
 * Verifică codul OTP introdus de utilizator
 * 
 * Body: { email: "user@example.com", code: "123456" }
 * Response: { success: true, verified: true }
 */
app.post('/api/email/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // Validare input
    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email-ul și codul sunt obligatorii' 
      });
    }
    
    // Verifică codul
    const result = await verifyOTP(email, code);
    
    if (result.success) {
      res.json({ 
        success: true, 
        verified: true,
        message: 'Codul este valid'
      });
    } else {
      res.status(400).json({ 
        success: false, 
        verified: false,
        error: result.error 
      });
    }
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Eroare la verificarea codului' 
    });
  }
});

/**
 * GET /api/health
 * Verifică starea serverului
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    email_enabled: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n📧 RATBV Email Server pornit pe portul ${PORT}`);
  console.log(`\n📡 Endpoint-uri disponibile:`);
  console.log(`   POST /api/email/send    - Trimite email cu cod OTP`);
  console.log(`   POST /api/email/verify  - Verifică cod OTP`);
  console.log(`   GET  /api/health        - Verificare stare server`);
  console.log(`\n🔧 Mod: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER ? '✅ Configurat' : '❌ Neconfigurat'}`);
  console.log(`\n💡 Testează cu: curl http://localhost:${PORT}/api/health\n`);
});
