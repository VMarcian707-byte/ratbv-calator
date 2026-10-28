/**
 * RATBV Brașov - Server Backend pentru SMS
 * 
 * Server Express care gestionează:
 * - Trimiterea SMS-urilor cu cod OTP prin Twilio
 * - Verificarea codurilor OTP
 * - Rate limiting și securitate
 * 
 * Rulează cu: node server.js
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendOTP, verifyOTP, cleanupExpiredOTPs } from './lib/sms.js';

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
 * POST /api/sms/send
 * Trimite SMS cu cod OTP la numărul specificat
 * 
 * Body: { phone: "0750884666" }
 * Response: { success: true, message: "Cod trimis" }
 */
app.post('/api/sms/send', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Validare input
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Numărul de telefon este obligatoriu' 
      });
    }
    
    // Trimite SMS
    const result = await sendOTP(phone);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Codul de verificare a fost trimis prin SMS',
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
    console.error('Error sending SMS:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Eroare la trimiterea SMS-ului' 
    });
  }
});

/**
 * POST /api/sms/verify
 * Verifică codul OTP introdus de utilizator
 * 
 * Body: { phone: "0750884666", code: "123456" }
 * Response: { success: true, verified: true }
 */
app.post('/api/sms/verify', async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    // Validare input
    if (!phone || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Telefonul și codul sunt obligatorii' 
      });
    }
    
    // Verifică codul
    const result = await verifyOTP(phone, code);
    
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
    sms_enabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n🚀 RATBV SMS Server pornit pe portul ${PORT}`);
  console.log(`\n📡 Endpoint-uri disponibile:`);
  console.log(`   POST /api/sms/send    - Trimite SMS cu cod OTP`);
  console.log(`   POST /api/sms/verify  - Verifică cod OTP`);
  console.log(`   GET  /api/health      - Verificare stare server`);
  console.log(`\n🔧 Mod: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Twilio: ${process.env.TWILIO_ACCOUNT_SID ? '✅ Configurat' : '❌ Neconfigurat'}`);
  console.log(`\n💡 Testează cu: curl http://localhost:${PORT}/api/health\n`);
});
