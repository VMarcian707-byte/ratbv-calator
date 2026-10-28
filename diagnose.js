#!/usr/bin/env node

/**
 * Script de diagnosticare pentru RATBV
 * Verifică toate componentele sistemului
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('\n🔍 DIAGNOSTICARE RATBV Brașov\n');
console.log('='.repeat(60));

let hasErrors = false;

// ============================================
// TEST 1: Verifică variabilele de mediu
// ============================================
console.log('\n📋 TEST 1: Variabile de mediu\n');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!supabaseUrl || supabaseUrl.includes('YOUR-PROJECT-ID')) {
  console.log('❌ VITE_SUPABASE_URL nu este configurat');
  console.log('   → Editează fișierul .env și adaugă URL-ul din Supabase');
  hasErrors = true;
} else {
  console.log('✅ VITE_SUPABASE_URL:', supabaseUrl);
}

if (!supabaseKey || supabaseKey === 'your-anon-key-here') {
  console.log('❌ VITE_SUPABASE_ANON_KEY nu este configurat');
  console.log('   → Editează fișierul .env și adaugă cheia din Supabase');
  hasErrors = true;
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY:', supabaseKey.substring(0, 20) + '...');
}

if (!emailUser || emailUser === 'your-email@gmail.com') {
  console.log('❌ EMAIL_USER nu este configurat');
  console.log('   → Editează fișierul .env și adaugă adresa ta de email');
  hasErrors = true;
} else {
  console.log('✅ EMAIL_USER:', emailUser);
}

if (!emailPass || emailPass === 'your-16-character-app-password') {
  console.log('❌ EMAIL_PASS nu este configurat');
  console.log('   → Generează App Password la: https://myaccount.google.com/apppasswords');
  hasErrors = true;
} else {
  console.log('✅ EMAIL_PASS:', emailPass.substring(0, 4) + '...');
}

// ============================================
// TEST 2: Conexiune Supabase
// ============================================
if (supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR-PROJECT-ID')) {
  console.log('\n📋 TEST 2: Conexiune Supabase\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Testează conexiunea
    const { data, error } = await supabase
      .from('responses')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Eroare la conectarea la Supabase:', error.message);
      
      if (error.message.includes('does not exist')) {
        console.log('   → Tabela "responses" nu există');
        console.log('   → Rulează supabase/migrate-quick.sql în SQL Editor');
      }
      
      hasErrors = true;
    } else {
      console.log('✅ Conexiune Supabase reușită');
      console.log('✅ Tabela "responses" există');
      console.log('   Număr înregistrări:', data);
    }
  } catch (err) {
    console.log('❌ Eroare la testarea Supabase:', err.message);
    hasErrors = true;
  }
} else {
  console.log('\n📋 TEST 2: Conexiune Supabase\n');
  console.log('⚠️  Supabase nu este configurat - se folosește localStorage');
}

// ============================================
// TEST 3: Conexiune Email
// ============================================
if (emailUser && emailPass && !emailUser.includes('your-email')) {
  console.log('\n📋 TEST 3: Conexiune Email\n');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    
    // Testează conexiunea
    await transporter.verify();
    console.log('✅ Conexiune SMTP reușită');
    console.log('   Server email configurat corect');
    
    // Testează trimiterea unui email
    console.log('\n📧 Test trimitere email...');
    
    const testEmail = emailUser; // Trimite către tine însuți
    
    const info = await transporter.sendMail({
      from: `"RATBV Test" <${emailUser}>`,
      to: testEmail,
      subject: '🧪 Test Email RATBV',
      text: 'Acesta este un email de test. Dacă îl primești, configurația email este corectă!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">🧪 Test Email RATBV</h2>
          <p>Acesta este un email de test.</p>
          <p style="background: #10b981; color: white; padding: 10px; border-radius: 5px;">
            ✅ Dacă primești acest email, configurația este corectă!
          </p>
          <p>Timp: ${new Date().toLocaleString('ro-RO')}</p>
        </div>
      `,
    });
    
    console.log('✅ Email de test trimis cu succes');
    console.log('   Verifică inbox-ul:', testEmail);
    console.log('   Message ID:', info.messageId);
    
  } catch (err) {
    console.log('❌ Eroare la testarea email:', err.message);
    
    if (err.code === 'EAUTH') {
      console.log('   → Autentificare eșuată');
      console.log('   → Verifică EMAIL_USER și EMAIL_PASS');
      console.log('   → Asigură-te că folosești App Password (nu parola normală)');
      console.log('   → Generează la: https://myaccount.google.com/apppasswords');
    } else if (err.code === 'ECONNECTION') {
      console.log('   → Nu se poate conecta la serverul SMTP');
      console.log('   → Verifică conexiunea la internet');
    }
    
    hasErrors = true;
  }
} else {
  console.log('\n📋 TEST 3: Conexiune Email\n');
  console.log('⚠️  Email nu este configurat');
}

// ============================================
// TEST 4: Server Backend
// ============================================
console.log('\n📋 TEST 4: Server Backend\n');

try {
  const response = await fetch('http://localhost:3001/api/health');
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Server backend rulează pe portul 3001');
    console.log('   Status:', data.status);
    console.log('   Email enabled:', data.email_enabled);
  } else {
    console.log('❌ Server backend a răspuns cu eroare:', response.status);
    hasErrors = true;
  }
} catch (err) {
  console.log('❌ Server backend nu rulează');
  console.log('   → Pornește serverul cu: node server-email.js');
  hasErrors = true;
}

// ============================================
// TEST 5: Aplicație Frontend
// ============================================
console.log('\n📋 TEST 5: Aplicație Frontend\n');

try {
  const response = await fetch('http://localhost:5173');
  
  if (response.ok) {
    console.log('✅ Aplicația frontend rulează pe portul 5173');
    console.log('   → Deschide: http://localhost:5173');
  } else {
    console.log('❌ Aplicația frontend a răspuns cu eroare:', response.status);
    hasErrors = true;
  }
} catch (err) {
  console.log('❌ Aplicația frontend nu rulează');
  console.log('   → Pornește aplicația cu: npm run dev');
  hasErrors = true;
}

// ============================================
// REZULTAT FINAL
// ============================================
console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('\n❌ DIAGNOSTICARE: S-AU GĂSIT ERORI\n');
  console.log('Rezolvă problemele de mai sus și rulează din nou acest script.');
  console.log('\nInstrucțiuni complete:');
  console.log('  → EMAIL_SETUP.md - Configurare email');
  console.log('  → SETUP.md - Configurare Supabase');
  console.log('  → README.md - Instrucțiuni generale\n');
  process.exit(1);
} else {
  console.log('\n✅ DIAGNOSTICARE: TOATE TESTELE AU TRECUT!\n');
  console.log('Sistemul este configurat corect și gata de utilizare.');
  console.log('\nFlux complet:');
  console.log('  1. Deschide: http://localhost:5173');
  console.log('  2. Completează formularul');
  console.log('  3. Primești email cu cod OTP');
  console.log('  4. Verifici codul');
  console.log('  5. Primești cod QR');
  console.log('  6. Datele se salvează în Supabase\n');
  process.exit(0);
}
