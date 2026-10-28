#!/usr/bin/env node

/**
 * Test simplu API email - funcționează pe Windows/Linux/Mac
 */

console.log('\n🧪 Test API Email\n');

const testEmail = 'test@ratbv.ro';

console.log('Se trimite request la: http://localhost:3001/api/email/send');
console.log('Email:', testEmail);
console.log('');

try {
  const response = await fetch('http://localhost:3001/api/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: testEmail }),
  });

  const data = await response.json();

  if (data.success) {
    console.log('✅ SUCCES!');
    console.log('   Mesaj:', data.message);
    if (data.testCode) {
      console.log('   Cod OTP:', data.testCode);
    }
    console.log('\n📧 Verifică inbox-ul:', testEmail);
  } else {
    console.log('❌ EROARE!');
    console.log('   Mesaj:', data.error);
  }
} catch (error) {
  console.log('❌ EROARE DE CONEXIUNE!');
  console.log('   Mesaj:', error.message);
  console.log('');
  console.log('   → Serverul de email nu rulează!');
  console.log('   → Pornește-l cu: node server-email.js');
}

console.log('');
