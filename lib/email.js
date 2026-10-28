/**
 * RATBV Brașov - Librărie Email OTP
 * 
 * Gestionează:
 * - Generarea codurilor OTP
 * - Trimiterea email-urilor cu cod OTP prin Nodemailer
 * - Verificarea codurilor OTP
 * - Rate limiting și expirare
 * 
 * GRATUIT! Fără costuri per email (folosește Gmail SMTP)
 */

import nodemailer from 'nodemailer';
import crypto from 'crypto';

// ============================================
// CONFIGURARE EMAIL
// ============================================

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailFrom = process.env.EMAIL_FROM || emailUser;

// Configurare transporter Nodemailer (Gmail)
const transporter = emailUser && emailPass
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    })
  : null;

// ============================================
// STOCARE OTP (în memorie - pentru demo)
// ============================================

// Map: email -> { code, attempts, createdAt, expiresAt }
const otpStore = new Map();

// Configurare OTP
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10; // Email poate dura mai mult decât SMS
const MAX_ATTEMPTS = 5; // Mai multe încercări pentru email
const MAX_EMAILS_PER_DAY = 10;
const RATE_LIMIT_MINUTES = 1;

// ============================================
// FUNCȚII UTILITARE
// ============================================

/**
 * Generează un cod OTP securizat de 6 cifre
 */
function generateOTP() {
  const buffer = crypto.randomBytes(3);
  const code = (buffer.readUIntBE(0, 3) % 1000000).toString().padStart(6, '0');
  return code;
}

/**
 * Validează formatul email-ului
 */
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Normalizăm email-ul (lowercase, trim)
 */
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * Verifică dacă s-a depășit limita de email-uri pe zi
 */
function checkDailyLimit(email) {
  const today = new Date().toDateString();
  const key = `${email}_${today}`;
  const count = otpStore.get(key) || 0;
  
  if (count >= MAX_EMAILS_PER_DAY) {
    return false;
  }
  
  otpStore.set(key, count + 1);
  return true;
}

/**
 * Verifică rate limiting (max 1 email per minut)
 */
function checkRateLimit(email) {
  const rateLimitKey = `rate_${email}`;
  const lastSent = otpStore.get(rateLimitKey);
  
  if (lastSent) {
    const minutesSinceLastSent = (Date.now() - lastSent) / (1000 * 60);
    if (minutesSinceLastSent < RATE_LIMIT_MINUTES) {
      return false;
    }
  }
  
  otpStore.set(rateLimitKey, Date.now());
  return true;
}

/**
 * Curăță OTP-urile expirate din memorie
 */
export function cleanupExpiredOTPs() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt && now > data.expiresAt) {
      otpStore.delete(email);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Curățate ${cleaned} OTP-uri expirate`);
  }
}

// ============================================
// FUNCȚII PRINCIPALE
// ============================================

/**
 * Trimite email cu cod OTP
 */
export async function sendOTP(email) {
  try {
    // Validare email
    const normalizedEmail = normalizeEmail(email);
    
    if (!validateEmail(normalizedEmail)) {
      return {
        success: false,
        error: 'Adresă de email invalidă'
      };
    }
    
    // Verifică rate limiting
    if (!checkRateLimit(normalizedEmail)) {
      return {
        success: false,
        error: `Așteptați ${RATE_LIMIT_MINUTES} minut înainte de a cere un nou cod`
      };
    }
    
    // Verifică limita zilnică
    if (!checkDailyLimit(normalizedEmail)) {
      return {
        success: false,
        error: `Limita de ${MAX_EMAILS_PER_DAY} email-uri pe zi a fost atinsă`
      };
    }
    
    // Generează cod OTP
    const code = generateOTP();
    const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
    
    // Stochează OTP-ul
    otpStore.set(normalizedEmail, {
      code,
      attempts: 0,
      createdAt: Date.now(),
      expiresAt
    });
    
    // Trimite email (doar dacă Nodemailer este configurat)
    if (transporter) {
      const mailOptions = {
        from: `"RATBV Brașov" <${emailFrom}>`,
        to: normalizedEmail,
        subject: 'Codul tău de verificare RATBV',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .code-box { background: white; border: 2px dashed #3b82f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
              .code { font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace; }
              .info { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
              .warning { color: #dc2626; font-size: 14px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🚌 RATBV Brașov</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Feedback & Recompense</p>
              </div>
              
              <div class="content">
                <h2 style="color: #1e40af; margin-top: 0;">Codul tău de verificare</h2>
                
                <p>Bună ziua,</p>
                
                <p>Mulțumim că ai ales să ne oferi feedback despre serviciile RATBV Brașov!</p>
                
                <p>Folosește acest cod pentru a-ți verifica adresa de email:</p>
                
                <div class="code-box">
                  <div class="code">${code}</div>
                </div>
                
                <div class="info">
                  <strong>ℹ️ Informații importante:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Codul este valabil <strong>${OTP_EXPIRY_MINUTES} minute</strong></li>
                    <li>Nu partaja acest cod cu nimeni</li>
                    <li>Dacă nu ai solicitat acest cod, ignoră acest email</li>
                  </ul>
                </div>
                
                <p>După verificare, vei primi <strong>3 călătorii gratuite</strong> pe care le poți ridica de la ghișeul RATBV.</p>
                
                <p class="warning">
                  ⚠️ <strong>Atenție:</strong> Codul QR generat după verificare este unic și netransferabil.
                </p>
                
                <p>Cu stimă,<br>Echipa RATBV Brașov</p>
              </div>
              
              <div class="footer">
                <p>Acest email a fost trimis automat. Nu răspunde la acest mesaj.</p>
                <p>© 2024 RATBV Brașov - Transport public de calitate</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
RATBV Brașov - Cod de verificare

Codul tău de verificare este: ${code}

Acest cod este valabil ${OTP_EXPIRY_MINUTES} minute.
Nu partaja acest cod cu nimeni.

După verificare, vei primi 3 călătorii gratuite.

© 2024 RATBV Brașov
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email trimis către ${normalizedEmail}`);
    } else {
      // Mod demo - doar loghează codul
      console.log(`\n📧 [DEMO MODE] Cod OTP pentru ${normalizedEmail}: ${code}`);
      console.log(`   (Nodemailer nu este configurat - vezi EMAIL_SETUP.md)\n`);
    }
    
    return {
      success: true,
      code, // Doar pentru testare - în producție nu trimite codul înapoi!
      expiresAt
    };
    
  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    // Eroare specifică Nodemailer
    if (error.code === 'EAUTH') {
      return {
        success: false,
        error: 'Eroare de autentificare. Verifică credențialele email.'
      };
    }
    
    if (error.code === 'ECONNECTION') {
      return {
        success: false,
        error: 'Eroare de conexiune la serverul de email.'
      };
    }
    
    return {
      success: false,
      error: 'Eroare la trimiterea email-ului'
    };
  }
}

/**
 * Verifică codul OTP introdus de utilizator
 */
export async function verifyOTP(email, code) {
  try {
    const normalizedEmail = normalizeEmail(email);
    const otpData = otpStore.get(normalizedEmail);
    
    // Verifică dacă există OTP
    if (!otpData) {
      return {
        success: false,
        error: 'Codul a expirat sau nu a fost solicitat. Cere un cod nou.'
      };
    }
    
    // Verifică dacă a expirat
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(normalizedEmail);
      return {
        success: false,
        error: 'Codul a expirat. Cere un cod nou.'
      };
    }
    
    // Verifică numărul de încercări
    if (otpData.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(normalizedEmail);
      return {
        success: false,
        error: `Prea multe încercări. Cere un cod nou.`
      };
    }
    
    // Increment attempts
    otpData.attempts++;
    
    // Verifică codul
    if (otpData.code !== code) {
      const remainingAttempts = MAX_ATTEMPTS - otpData.attempts;
      return {
        success: false,
        error: `Cod invalid. Mai ai ${remainingAttempts} încerc${remainingAttempts === 1 ? 'are' : 'ări'}.`
      };
    }
    
    // Cod valid! Șterge OTP-ul
    otpStore.delete(normalizedEmail);
    
    console.log(`✅ OTP email verificat cu succes pentru ${normalizedEmail}`);
    
    return {
      success: true,
      verified: true
    };
    
  } catch (error) {
    console.error('Error verifying OTP email:', error);
    return {
      success: false,
      error: 'Eroare la verificarea codului'
    };
  }
}

// ============================================
// FUNCȚII PENTRU TESTARE
// ============================================

/**
 * Obține OTP-ul curent pentru un email (doar pentru testare)
 */
export function getTestOTP(email) {
  const normalizedEmail = normalizeEmail(email);
  const otpData = otpStore.get(normalizedEmail);
  return otpData ? otpData.code : null;
}

/**
 * Resetează toate OTP-urile (doar pentru testare)
 */
export function resetAllOTPs() {
  otpStore.clear();
  console.log('🗑️ Toate OTP-urile au fost resetate');
}
