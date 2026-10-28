#!/usr/bin/env node

/**
 * Test complet: API + Supabase + Email
 * Arată răspunsul complet de la server
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

console.log('\n🧪 TEST COMPLET CU RĂSPUNS DETALIAT\n');
console.log('='.repeat(60));

const testEmail = 'test@ratbv.ro';

// TEST 1: API Email
console.log('\n📋 TEST 1: API Email\n');

try {
  const response = await fetch('http://localhost:3001/api/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: testEmail }),
  });

  console.log('Status:', response.status, response.statusText);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));
  
  const data = await response.json();
  console.log('\nRăspuns complet:');
  console.log(JSON.stringify(data, null, 2));

  if (data.success) {
    console.log('\n✅ Email trimis cu succes!');
    if (data.testCode) {
      console.log('   Cod OTP:', data.testCode);
    }
  } else {
    console.log('\n❌ Eroare:', data.error);
  }
} catch (error) {
  console.log('❌ Eroare de conexiune:', error.message);
}

// TEST 2: Supabase
console.log('\n📋 TEST 2: Supabase\n');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR-PROJECT-ID')) {
  console.log('❌ Supabase NU este configurat!');
  console.log('   → Editează fișierul .env');
  console.log('   → Adaugă VITE_SUPABASE_URL și VITE_SUPABASE_ANON_KEY');
  console.log('   → Repornește aplicația cu: npm run dev');
} else {
  console.log('✅ Supabase configurat:');
  console.log('   URL:', supabaseUrl);
  console.log('   Key:', supabaseKey.substring(0, 20) + '...');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Testează inserarea
  console.log('\nSe testează inserarea în Supabase...');

  try {
    const { data: insertData, error: insertError } = await supabase
      .from('responses')
      .insert({
        email: testEmail,
        cleanliness_rating: 5,
        punctuality_rating: 5,
        feedback_text: 'Test automat',
        qr_code_id: 'RATBV-TEST' + Date.now(),
        status: 'PENDING',
      })
      .select();

    if (insertError) {
      console.log('❌ Eroare la inserare:', insertError.message);
      console.log('   Cod:', insertError.code);
      console.log('   Detalii:', insertError.details);
      
      if (insertError.message.includes('does not exist')) {
        console.log('\n   → Tabela "responses" nu există!');
        console.log('   → Rulează supabase/migrate-quick.sql în SQL Editor');
      }
    } else {
      console.log('✅ Inserare reușită!');
      console.log('   Date:', JSON.stringify(insertData, null, 2));

      // Șterge testul
      await supabase.from('responses').delete().eq('email', testEmail);
      console.log('   (Test șters)');
    }
  } catch (error) {
    console.log('❌ Eroare neașteptată:', error.message);
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n✅ Test complet finalizat!\n');
