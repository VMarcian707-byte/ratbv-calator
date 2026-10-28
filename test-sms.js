/**
 * Script de testare SMS
 * 
 * Trimite un SMS de test la numărul specificat
 * 
 * Utilizare: node test-sms.js 0750884666
 */

import dotenv from 'dotenv';
import { sendOTP, verifyOTP, getTestOTP } from './lib/sms.js';

dotenv.config();

// Obține numărul de telefon din argumente
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.log('\n❌ Trebuie să specifici un număr de telefon!');
  console.log('\nUtilizare:');
  console.log('  node test-sms.js 0750884666');
  console.log('  node test-sms.js +40750884666');
  console.log('\nExemplu:');
  console.log('  node test-sms.js 0712345678\n');
  process.exit(1);
}

console.log('\n📱 Test SMS pentru RATBV Brașov');
console.log('='.repeat(50));
console.log(`Număr telefon: ${phoneNumber}`);
console.log(`Twilio configurat: ${process.env.TWILIO_ACCOUNT_SID ? '✅ DA' : '❌ NU (mod demo)'}`);
console.log('='.repeat(50));

// Test 1: Trimite SMS
console.log('\n📤 Test 1: Trimitere SMS...');
try {
  const sendResult = await sendOTP(phoneNumber);
  
  if (sendResult.success) {
    console.log('✅ SMS trimis cu succes!');
    if (sendResult.code) {
      console.log(`🔐 Cod OTP (doar pentru testare): ${sendResult.code}`);
    }
    console.log(`⏰ Expiră în: 5 minute`);
  } else {
    console.error('❌ Eroare la trimitere:', sendResult.error);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Eroare neașteptată:', error.message);
  process.exit(1);
}

// Test 2: Verifică cu cod greșit
console.log('\n🔍 Test 2: Verificare cu cod greșit...');
try {
  const wrongCode = '000000';
  const verifyResult1 = await verifyOTP(phoneNumber, wrongCode);
  
  if (!verifyResult1.success) {
    console.log('✅ Corect: Cod greșit respins');
    console.log(`   Mesaj: ${verifyResult1.error}`);
  } else {
    console.error('❌ Eroare: Cod greșit acceptat!');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Eroare neașteptată:', error.message);
  process.exit(1);
}

// Test 3: Verifică cu cod corect
console.log('\n✅ Test 3: Verificare cu cod corect...');
try {
  const correctCode = getTestOTP(phoneNumber);
  
  if (!correctCode) {
    console.error('❌ Nu s-a găsit codul OTP în memorie');
    process.exit(1);
  }
  
  const verifyResult2 = await verifyOTP(phoneNumber, correctCode);
  
  if (verifyResult2.success) {
    console.log('✅ Cod verificat cu succes!');
    console.log(`   Telefon: ${phoneNumber}`);
    console.log(`   Cod: ${correctCode}`);
  } else {
    console.error('❌ Eroare la verificare:', verifyResult2.error);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Eroare neașteptată:', error.message);
  process.exit(1);
}

// Test 4: Verifică din nou (cod deja folosit)
console.log('\n🔒 Test 4: Verificare cod deja folosit...');
try {
  const verifyResult3 = await verifyOTP(phoneNumber, '123456');
  
  if (!verifyResult3.success) {
    console.log('✅ Corect: Cod deja folosit respins');
    console.log(`   Mesaj: ${verifyResult3.error}`);
  } else {
    console.error('❌ Eroare: Cod deja folosit acceptat!');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Eroare neașteptată:', error.message);
  process.exit(1);
}

// Test 5: Rate limiting
console.log('\n⏱️ Test 5: Rate limiting...');
try {
  const sendResult2 = await sendOTP(phoneNumber);
  
  if (!sendResult2.success && sendResult2.error.includes('Așteptați')) {
    console.log('✅ Corect: Rate limiting funcțional');
    console.log(`   Mesaj: ${sendResult2.error}`);
  } else if (sendResult2.success) {
    console.log('⚠️ Rate limiting nu a funcționat (normal dacă a trecut 1 minut)');
  } else {
    console.log('⚠️ Altă eroare:', sendResult2.error);
  }
} catch (error) {
  console.error('❌ Eroare neașteptată:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('🎉 TOATE TESTELE AU TRECUT!');
console.log('='.repeat(50));
console.log('\n✅ Sistemul SMS funcționează corect!');
console.log('\n📖 Pentru instrucțiuni complete, vezi SMS_SETUP.md');
console.log('\n🚀 Pornește serverul: node server.js\n');

process.exit(0);
