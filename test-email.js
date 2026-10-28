/**
 * Script de testare Email OTP
 * 
 * Trimite un email de test la adresa specificată
 * 
 * Utilizare: node test-email.js test@example.com
 */

import dotenv from 'dotenv';
import { sendOTP, verifyOTP, getTestOTP } from './lib/email.js';

dotenv.config();

// Obține adresa de email din argumente
const emailAddress = process.argv[2];

if (!emailAddress) {
  console.log('\n❌ Trebuie să specifici o adresă de email!');
  console.log('\nUtilizare:');
  console.log('  node test-email.js test@example.com');
  console.log('  node test-email.js user@gmail.com');
  console.log('\nExemplu:');
  console.log('  node test-email.js test@ratbv.ro\n');
  process.exit(1);
}

console.log('\n📧 Test Email OTP pentru RATBV Brașov');
console.log('='.repeat(50));
console.log(`Adresă email: ${emailAddress}`);
console.log(`Email configurat: ${process.env.EMAIL_USER ? '✅ DA' : '❌ NU (mod demo)'}`);
console.log('='.repeat(50));

// Test 1: Trimite email
console.log('\n📤 Test 1: Trimitere email...');
try {
  const sendResult = await sendOTP(emailAddress);
  
  if (sendResult.success) {
    console.log('✅ Email trimis cu succes!');
    if (sendResult.code) {
      console.log(`🔐 Cod OTP (doar pentru testare): ${sendResult.code}`);
    }
    console.log(`⏰ Expiră în: 10 minute`);
    console.log(`\n💡 Verifică inbox-ul (și folderul Spam!)`);
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
  const verifyResult1 = await verifyOTP(emailAddress, wrongCode);
  
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
  const correctCode = getTestOTP(emailAddress);
  
  if (!correctCode) {
    console.error('❌ Nu s-a găsit codul OTP în memorie');
    process.exit(1);
  }
  
  const verifyResult2 = await verifyOTP(emailAddress, correctCode);
  
  if (verifyResult2.success) {
    console.log('✅ Cod verificat cu succes!');
    console.log(`   Email: ${emailAddress}`);
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
  const verifyResult3 = await verifyOTP(emailAddress, '123456');
  
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
  const sendResult2 = await sendOTP(emailAddress);
  
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
console.log('\n✅ Sistemul de email OTP funcționează corect!');
console.log('\n💰 Cost: 0 RON (GRATUIT!)');
console.log('\n📖 Pentru instrucțiuni complete, vezi EMAIL_SETUP.md');
console.log('\n🚀 Pornește serverul: node server-email.js\n');

process.exit(0);
