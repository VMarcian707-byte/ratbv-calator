/**
 * Script de testare conexiune Supabase
 * 
 * Rulează: node test-supabase.js
 * 
 * Verifică dacă credențialele Supabase sunt corecte
 * și dacă tabela responses există.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Încarcă variabilele de mediu
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testare conexiune Supabase...\n');

// Verifică dacă variabilele există
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ EROARE: Variabilele de mediu lipsesc!');
  console.error('\nSoluție:');
  console.error('1. Creează fișier .env în folderul rădăcină');
  console.error('2. Adaugă:');
  console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.error('\nVezi SETUP.md pentru instrucțiuni complete.');
  process.exit(1);
}

console.log('✅ Variabile de mediu găsite');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...\n`);

// Creează client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test 1: Verifică conexiunea
console.log('📡 Test 1: Verificare conexiune...');
try {
  const { error } = await supabase.from('responses').select('count', { count: 'exact', head: true });
  
  if (error) {
    if (error.message.includes('does not exist') || error.code === '42P01') {
      console.error('❌ EROARE: Tabela "responses" nu există!');
      console.error('\nSoluție:');
      console.error('1. Mergi în Supabase Dashboard');
      console.error('2. SQL Editor → New query');
      console.error('3. Copiază conținutul din supabase/schema.sql');
      console.error('4. Click "Run"');
      process.exit(1);
    } else {
      console.error('❌ EROARE la conectare:', error.message);
      console.error('\nVerifică credențialele în fișierul .env');
      process.exit(1);
    }
  }
  
  console.log('✅ Conexiune reușită!\n');
} catch (err) {
  console.error('❌ EROARE neașteptată:', err.message);
  process.exit(1);
}

// Test 2: Verifică structura tabelei
console.log('📊 Test 2: Verificare structură tabelă...');
try {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ EROARE la citirea tabelei:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Structură tabelă corectă\n');
  
  if (data && data.length > 0) {
    console.log(`📈 Statistici:`);
    console.log(`   - Total răspunsuri: ${data.length}`);
    console.log(`   - Primul răspuns creat: ${data[0].created_at}`);
  } else {
    console.log('📭 Tabela este goală (niciun răspuns încă)');
  }
  
} catch (err) {
  console.error('❌ EROARE:', err.message);
  process.exit(1);
}

// Test 3: Test insert
console.log('\n🧪 Test 3: Test inserare rând...');
try {
  const testPhone = '0700000000';
  const testQrId = 'RATBV-TEST1';
  
  // Șterge datele de test dacă există
  await supabase.from('responses').delete().eq('qr_code_id', testQrId);
  
  // Inserează rând de test
  const { data, error } = await supabase
    .from('responses')
    .insert({
      phone_number: testPhone,
      cleanliness_rating: 5,
      punctuality_rating: 5,
      feedback_text: 'Test automat',
      qr_code_id: testQrId,
      status: 'PENDING'
    })
    .select()
    .single();
  
  if (error) {
    console.error('❌ EROARE la inserare:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Inserare reușită!');
  console.log(`   ID: ${data.id}`);
  console.log(`   QR Code: ${data.qr_code_id}`);
  console.log(`   Status: ${data.status}`);
  
  // Șterge datele de test
  await supabase.from('responses').delete().eq('qr_code_id', testQrId);
  console.log('✅ Date de test curățate\n');
  
} catch (err) {
  console.error('❌ EROARE:', err.message);
  process.exit(1);
}

// Test 4: Verifică constrângeri
console.log('🔒 Test 4: Verificare constrângeri unicitate...');
try {
  const testPhone = '0711111111';
  const testQrId1 = 'RATBV-UNIQ1';
  const testQrId2 = 'RATBV-UNIQ2';
  
  // Curăță datele de test
  await supabase.from('responses').delete().eq('phone_number', testPhone);
  
  // Inserează primul rând
  await supabase.from('responses').insert({
    phone_number: testPhone,
    cleanliness_rating: 4,
    punctuality_rating: 4,
    qr_code_id: testQrId1,
    status: 'PENDING'
  });
  
  // Încearcă să inserezi al doilea rând cu același telefon
  const { error } = await supabase.from('responses').insert({
    phone_number: testPhone,
    cleanliness_rating: 3,
    punctuality_rating: 3,
    qr_code_id: testQrId2,
    status: 'PENDING'
  });
  
  if (error && error.code === '23505') {
    console.log('✅ Constrângere unicitate telefon funcțională!');
  } else if (!error) {
    console.error('❌ ATENȚIE: Constrângerea de unicitate nu funcționează!');
    console.error('   Poți insera același telefon de mai multe ori.');
  } else {
    console.error('❌ EROARE neașteptată:', error.message);
  }
  
  // Curăță datele de test
  await supabase.from('responses').delete().eq('phone_number', testPhone);
  
} catch (err) {
  console.error('❌ EROARE:', err.message);
}

console.log('\n' + '='.repeat(50));
console.log('🎉 TOATE TESTELE AU TRECUT!');
console.log('='.repeat(50));
console.log('\n✅ Supabase este configurat corect!');
console.log('✅ Poți folosi aplicația în mod producție.');
console.log('\n📖 Pentru instrucțiuni complete, vezi SETUP.md');
console.log('\n🚀 Pornește aplicația: npm run dev\n');

process.exit(0);
