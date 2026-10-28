/**
 * RATBV Brașov - Client Supabase + Mod Demo
 * 
 * Configurare client Supabase pentru conectare la baza de date PostgreSQL.
 * Dacă Supabase nu este configurat, funcționează în mod DEMO cu localStorage.
 * 
 * Variabilele de mediu opționale în fișierul .env:
 *   VITE_SUPABASE_URL=https://your-project.supabase.co
 *   VITE_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient } from '@supabase/supabase-js';

// Verificăm dacă Supabase este configurat
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mod demo activat dacă nu avem credențiale Supabase
export const isDemoMode = !supabaseUrl || !supabaseAnonKey || 
  supabaseUrl === 'https://placeholder.supabase.co' || 
  supabaseAnonKey === 'placeholder-key';

// Creare client Supabase (doar dacă avem credențiale valide)
export const supabase = !isDemoMode 
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
    })
  : null;

// ============================================
// TIPURI TypeScript pentru tabelul responses
// ============================================

export interface ResponseRow {
  id: number;
  email: string;
  cleanliness_rating: number;
  punctuality_rating: number;
  feedback_text: string | null;
  qr_code_id: string;
  status: 'PENDING' | 'REDEEMED';
  created_at: string;
  redeemed_at: string | null;
  cashier_id: string | null;
}

export interface NewResponse {
  email: string;
  cleanliness_rating: number;
  punctuality_rating: number;
  feedback_text?: string;
  qr_code_id: string;
}

// ============================================
// FUNCȚII UTILITARE
// ============================================

/**
 * Generează un ID unic pentru codul QR
 * Format: RATBV-XXXXX (5 caractere alfanumerice)
 */
export function generateQrCodeId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'RATBV-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validează formatul email-ului
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Normalizează email-ul (lowercase, trim)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ============================================
// STOCARE LOCALĂ (Mod Demo)
// ============================================

const STORAGE_KEY = 'ratbv_responses';

function getLocalResponses(): ResponseRow[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalResponses(responses: ResponseRow[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

// ============================================
// FUNCȚII CRUD (funcționează cu Supabase sau localStorage)
// ============================================

/**
 * Inserează un răspuns nou
 */
export async function insertResponse(data: NewResponse): Promise<{
  success: boolean;
  error?: string;
  data?: ResponseRow;
}> {
  // === MOD DEMO (localStorage) ===
  if (isDemoMode) {
    const responses = getLocalResponses();
    
    // Verificare duplicat email
    if (responses.some(r => r.email === data.email)) {
      return {
        success: false,
        error: 'Această adresă de email a fost deja folosită pentru o recompensă!',
      };
    }
    
    // Verificare duplicat QR code
    if (responses.some(r => r.qr_code_id === data.qr_code_id)) {
      return {
        success: false,
        error: 'Eroare la generarea codului. Încercați din nou.',
      };
    }
    
    const newRow: ResponseRow = {
      id: Date.now(),
      email: data.email,
      cleanliness_rating: data.cleanliness_rating,
      punctuality_rating: data.punctuality_rating,
      feedback_text: data.feedback_text || null,
      qr_code_id: data.qr_code_id,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      redeemed_at: null,
      cashier_id: null,
    };
    
    responses.push(newRow);
    saveLocalResponses(responses);
    
    return { success: true, data: newRow };
  }
  
  // === MOD SUPABASE ===
  const { data: result, error } = await supabase!
    .from('responses')
    .insert({
      email: data.email,
      cleanliness_rating: data.cleanliness_rating,
      punctuality_rating: data.punctuality_rating,
      feedback_text: data.feedback_text || null,
      qr_code_id: data.qr_code_id,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505' && error.message.includes('email')) {
      return {
        success: false,
        error: 'Această adresă de email a fost deja folosită pentru o recompensă!',
      };
    }
    if (error.code === '23505' && error.message.includes('qr_code_id')) {
      return {
        success: false,
        error: 'Eroare la generarea codului. Încercați din nou.',
      };
    }
    return {
      success: false,
      error: 'A apărut o eroare. Încercați din nou.',
    };
  }

  return { success: true, data: result as ResponseRow };
}

/**
 * Caută un răspuns după codul QR
 */
export async function findByQrCode(qrCodeId: string): Promise<{
  found: boolean;
  data?: ResponseRow;
}> {
  // === MOD DEMO ===
  if (isDemoMode) {
    const responses = getLocalResponses();
    const found = responses.find(r => r.qr_code_id === qrCodeId);
    if (found) return { found: true, data: found };
    return { found: false };
  }
  
  // === MOD SUPABASE ===
  const { data, error } = await supabase!
    .from('responses')
    .select('*')
    .eq('qr_code_id', qrCodeId)
    .single();

  if (error || !data) return { found: false };
  return { found: true, data: data as ResponseRow };
}

/**
 * Marchează un cod ca fiind revendicat (REDEEMED)
 */
export async function redeemQrCode(
  qrCodeId: string,
  cashierId: string = 'cashier-1'
): Promise<{
  success: boolean;
  error?: string;
  data?: ResponseRow;
}> {
  // === MOD DEMO ===
  if (isDemoMode) {
    const responses = getLocalResponses();
    const index = responses.findIndex(r => r.qr_code_id === qrCodeId);
    
    if (index === -1) {
      return { success: false, error: 'Codul nu a fost găsit.' };
    }
    
    if (responses[index].status === 'REDEEMED') {
      return { success: false, error: 'Codul a fost deja folosit.' };
    }
    
    responses[index].status = 'REDEEMED';
    responses[index].redeemed_at = new Date().toISOString();
    responses[index].cashier_id = cashierId;
    saveLocalResponses(responses);
    
    return { success: true, data: responses[index] };
  }
  
  // === MOD SUPABASE ===
  const { data, error } = await supabase!
    .from('responses')
    .update({
      status: 'REDEEMED',
      redeemed_at: new Date().toISOString(),
      cashier_id: cashierId,
    })
    .eq('qr_code_id', qrCodeId)
    .eq('status', 'PENDING')
    .select()
    .single();

  if (error) {
    return { success: false, error: 'Nu s-a putut actualiza statusul codului.' };
  }

  if (!data) {
    return { success: false, error: 'Codul nu mai este valid sau a fost deja folosit.' };
  }

  return { success: true, data: data as ResponseRow };
}
