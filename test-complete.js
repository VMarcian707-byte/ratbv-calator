#!/usr/bin/env node

/**
 * Test complet al fluxului: Frontend → Backend → Email → Supabase
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n🧪 TEST COMPLET FLUX RATBV\n');
console.log('='.repeat(60));

// TEST 1: Verifică serverul backend
console.log('\n📋 TEST 1: Server Backend\n');

try {
  const healthResponse = await fetch('http://localhost:3001/api/health');
  
  if (healthResponse.ok) {
    const healthData = await healthResponse.json();
    console.log('✅ Server backend rulează');
    console.log('   Status:', healthData.status);
    console.log('   Email enabled:', healthData.email_enabled);
  } else {
    console.log('❌ Server backend a răspuns cu eroare:', healthResponse.status);
    process.exit(1);
  }
} catch (err) {
  console.log('❌ Server backend nu rulează');
  console.log('   → Pornește serverul cu: node server-email.js');
  process.exit(1);
}

// TEST 2: Testează trimiterea email-ului prin API
console.log('\n📋 TEST 2: Trimitere Email prin API\n');

const testEmail = process.env.EMAIL_USER || 'test@ratbv.ro';

try {
  const sendResponse = await fetch('http://localhost:3001/api/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: testEmail }),
  });
  
  const sendData = await sendResponse.json();
  
  if (sendData.success) {
    console.log('✅ Email trimis cu succes prin API');
    console.log('   Către:', testEmail);
    if (sendData.testCode) {
      console.log('   Cod OTP (test):', sendData.testCode);
    }
    console.log('\n📧 Verifică inbox-ul:', testEmail);
  } else {
    console.log('❌ Eroare la trimiterea email-ului:', sendData.error);
    process.exit(1);
  }
} catch (err) {
  console.log('❌ Eroare la apelarea API-ului:', err.message);
  process.exit(1);
}

// TEST 3: Verifică aplicația frontend
console.log('\n📋 TEST 3: Aplicație Frontend\n');

try {
  const frontendResponse = await fetch('http://localhost:5173');
  
  if (frontendResponse.ok) {
    console.log('✅ Aplicația frontend rulează');
    console.log('   → Deschide: http://localhost:5173');
  } else {
    console.log('❌ Aplicația frontend a răspuns cu eroare:', frontendResponse.status);
    process.exit(1);
  }
} catch (err) {
  console.log('❌ Aplicația frontend nu rulează');
  console.log('   → Pornește aplicația cu: npm run dev');
  process.exit(1);
}

// TEST 4: Verifică variabilele de mediu
console.log('\n📋 TEST 4: Variabile de Mediu\n');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes('YOUR-PROJECT-ID')) {
  console.log('⚠️  VITE_SUPABASE_URL nu este configurat');
  console.log('   → Aplicația va folosi localStorage (mod demo)');
  console.log('   → Configurează .env pentru a salva în Supabase');
} else {
  console.log('✅ VITE_SUPABASE_URL configurat');
  console.log('   →', supabaseUrl);
}

if (!supabaseKey || supabaseKey === 'your-anon-key-here') {
  console.log('⚠️  VITE_SUPABASE_ANON_KEY nu este configurat');
  console.log('   → Aplicația va folosi localStorage (mod demo)');
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY configurat');
}

// TEST 5: Instrucțiuni pentru testare manuală
console.log('\n📋 TEST 5: Instrucțiuni Testare Manuală\n');

console.log('1. Deschide browser-ul: http://localhost:5173');
console.log('2. Apasă F12 pentru Developer Tools');
console.log('3. Mergi la tab-ul "Console"');
console.log('4. Completează formularul:');
console.log('   - Rating curățenie: 5 stele');
console.log('   - Rating punctualitate: 5 stele');
console.log('   - Feedback: "Test"');
console.log('   - Email:', testEmail);
console.log('5. Click "Trimite cod email"');
console.log('6. Verifică:');
console.log('   - Tab-ul "Network" - apare request la /api/email/send?');
console.log('   - Tab-ul "Console" - apar erori?');
console.log('   - Inbox email - primești cod OTP?');

// REZULTAT FINAL
console.log('\n' + '='.repeat(60));
console.log('\n✅ TOATE TESTELE AUTOMATE AU TRECUT!\n');
console.log('Serverul backend și frontend funcționează corect.');
console.log('Acum testează manual în browser și verifică consola (F12).\n');

process.exit(0);
