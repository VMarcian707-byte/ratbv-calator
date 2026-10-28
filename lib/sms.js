/**
 * RATBV Brașov - Librărie SMS & OTP
 * 
 * Gestionează:
 * - Generarea codurilor OTP
 * - Trimiterea SMS-urilor prin Twilio
 * - Verificarea codurilor OTP
 * - Rate limiting și expirare
 */

import twilio from 'twilio';
import crypto from 'crypto';

// ============================================
// CONFIGURARE TWILIO
// ============================================

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Client Twilio (doar dacă avem credențiale)
const twilioClient = (accountSid && authToken && fromNumber) 
  ? twilio(accountSid, authToken)
  : null;

// ============================================
// STOCARE OTP (în memorie - pentru demo)
// ============================================

// Map: phone -> { code, attempts, createdAt, expiresAt }
const otpStore = new Map();

// Configurare OTP
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const MAX_SMS_PER_DAY = 3;
const RATE_LIMIT_MINUTES = 1;

// ============================================
// FUNCȚII UTILITARE
// ============================================

/**
 * Generează un cod OTP securizat de 6 cifre
 */
function generateOTP() {
  // Folosește crypto pentru securitate
  const buffer = crypto.randomBytes(3);
  const code = (buffer.readUIntBE(0, 3) % 1000000).toString().padStart(6, '0');
  return code;
}

/**
 * Normalizăm numărul de telefon la format internațional
 */
function normalizePhoneForSMS(phone) {
  let clean = phone.replace(/[\s\-\(\)]/g, '');
  
  // Adaugă prefixul +40 dacă lipsește
  if (clean.startsWith('0')) {
    clean = '+40' + clean.slice(1);
  } else if (clean.startsWith('40')) {
    clean = '+' + clean;
  } else if (!clean.startsWith('+')) {
    clean = '+40' + clean;
  }
  
  return clean;
}

/**
 * Verifică dacă s-a depășit limita de SMS-uri pe zi
 */
function checkDailyLimit(phone) {
  const today = new Date().toDateString();
  const key = `${phone}_${today}`;
  const count = otpStore.get(key) || 0;
  
  if (count >= MAX_SMS_PER_DAY) {
    return false;
  }
  
  otpStore.set(key, count + 1);
  return true;
}

/**
 * Verifică rate limiting (max 1 SMS per minut per telefon)
 */
function checkRateLimit(phone) {
  const rateLimitKey = `rate_${phone}`;
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
  
  for (const [phone, data] of otpStore.entries()) {
    // Șterge doar OTP-urile (nu rate limiting sau daily counts)
    if (data.expiresAt && now > data.expiresAt) {
      otpStore.delete(phone);
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
 * Trimite SMS cu cod OTP la numărul specificat
 */
export async function sendOTP(phone) {
  try {
    // Validare telefon
    const normalizedPhone = normalizePhoneForSMS(phone);
    
    if (!/^(\+40|0)[2-7]\d{8}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return {
        success: false,
        error: 'Număr de telefon invalid'
      };
    }
    
    // Verifică rate limiting
    if (!checkRateLimit(normalizedPhone)) {
      return {
        success: false,
        error: `Așteptați ${RATE_LIMIT_MINUTES} minut înainte de a cere un nou cod`
      };
    }
    
    // Verifică limita zilnică
    if (!checkDailyLimit(normalizedPhone)) {
      return {
        success: false,
        error: `Limita de ${MAX_SMS_PER_DAY} SMS-uri pe zi a fost atinsă`
      };
    }
    
    // Generează cod OTP
    const code = generateOTP();
    const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
    
    // Stochează OTP-ul
    otpStore.set(normalizedPhone, {
      code,
      attempts: 0,
      createdAt: Date.now(),
      expiresAt
    });
    
    // Trimite SMS (doar dacă Twilio este configurat)
    if (twilioClient) {
      const message = `RATBV Brașov: Codul tău de verificare este ${code}. Valabil ${OTP_EXPIRY_MINUTES} minute. Nu partaja acest cod cu nimeni.`;
      
      await twilioClient.messages.create({
        body: message,
        from: fromNumber,
        to: normalizedPhone
      });
      
      console.log(`✅ SMS trimis către ${normalizedPhone}`);
    } else {
      // Mod demo - doar loghează codul
      console.log(`\n📱 [DEMO MODE] Cod OTP pentru ${normalizedPhone}: ${code}`);
      console.log(`   (Twilio nu este configurat - vezi SMS_SETUP.md)\n`);
    }
    
    return {
      success: true,
      code, // Doar pentru testare - în producție nu trimite codul înapoi!
      expiresAt
    };
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Eroare specifică Twilio
    if (error.code === 21211) {
      return {
        success: false,
        error: 'Număr de telefon invalid'
      };
    }
    
    if (error.code === 21608 || error.code === 21614) {
      return {
        success: false,
        error: 'Nu s-a putut trimite SMS-ul. Verifică configurația Twilio.'
      };
    }
    
    return {
      success: false,
      error: 'Eroare la trimiterea SMS-ului'
    };
  }
}

/**
 * Verifică codul OTP introdus de utilizator
 */
export async function verifyOTP(phone, code) {
  try {
    const normalizedPhone = normalizePhoneForSMS(phone);
    const otpData = otpStore.get(normalizedPhone);
    
    // Verifică dacă există OTP
    if (!otpData) {
      return {
        success: false,
        error: 'Codul a expirat sau nu a fost solicitat. Cere un cod nou.'
      };
    }
    
    // Verifică dacă a expirat
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(normalizedPhone);
      return {
        success: false,
        error: 'Codul a expirat. Cere un cod nou.'
      };
    }
    
    // Verifică numărul de încercări
    if (otpData.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(normalizedPhone);
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
    otpStore.delete(normalizedPhone);
    
    console.log(`✅ OTP verificat cu succes pentru ${normalizedPhone}`);
    
    return {
      success: true,
      verified: true
    };
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
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
 * Obține OTP-ul curent pentru un telefon (doar pentru testare)
 */
export function getTestOTP(phone) {
  const normalizedPhone = normalizePhoneForSMS(phone);
  const otpData = otpStore.get(normalizedPhone);
  return otpData ? otpData.code : null;
}

/**
 * Resetează toate OTP-urile (doar pentru testare)
 */
export function resetAllOTPs() {
  otpStore.clear();
  console.log('🗑️ Toate OTP-urile au fost resetate');
}
