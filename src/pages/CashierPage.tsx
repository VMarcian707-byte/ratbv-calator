/**
 * RATBV Brașov - Interfața Ghișeului
 * 
 * Pagină minimalistă pentru casier/doamna de la ghișeu:
 * - Scanner video QR prin camera dispozitivului
 * - Input manual fallback pentru tastare cod
 * - Validare instantanee cu feedback vizual colorat:
 *   - VERDE: Cod valid, se acordă 3 bilete
 *   - GALBEN/PORTOCALIU: Cod deja folosit
 *   - ROȘU: Cod invalid/inexistent
 * - Resetare automată după 3 secunde
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Keyboard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ticket,
  Mail,
  Clock,
  RotateCcw,
  ScanLine,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { findByQrCode, redeemQrCode, isDemoMode, type ResponseRow } from '../lib/supabase';

// ============================================
// TIPURI
// ============================================

type ScanResult =
  | { type: 'VALID'; data: ResponseRow }
  | { type: 'ALREADY_REDEEMED'; data: ResponseRow }
  | { type: 'INVALID' }
  | null;

// ============================================
// COMPONENTA PRINCIPALĂ
// ============================================

export default function CashierPage() {
  const [mode, setMode] = useState<'scanner' | 'manual'>('scanner');
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================
  // PROCESARE COD SCANAT
  // ============================================
  const processCode = useCallback(async (code: string) => {
    if (isProcessing || scanResult) return;

    // Opri scanner-ul temporar
    setIsProcessing(true);
    const trimmedCode = code.trim().toUpperCase();

    try {
      // Căutare în baza de date
      const { found, data } = await findByQrCode(trimmedCode);

      if (!found) {
        setScanResult({ type: 'INVALID' });
        startCountdown();
        return;
      }

      if (data!.status === 'REDEEMED') {
        setScanResult({ type: 'ALREADY_REDEEMED', data: data! });
        startCountdown();
        return;
      }

      // Status PENDING -> Revendicare
      const redeemResult = await redeemQrCode(trimmedCode);

      if (redeemResult.success && redeemResult.data) {
        setScanResult({ type: 'VALID', data: redeemResult.data });
        startCountdown();
      } else {
        setScanResult({ type: 'INVALID' });
        startCountdown();
      }
    } catch (error) {
      console.error('Process error:', error);
      setScanResult({ type: 'INVALID' });
      startCountdown();
    }
  }, [isProcessing, scanResult]);

  // ============================================
  // COUNTDOWN RESETARE
  // ============================================
  const startCountdown = useCallback(() => {
    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          resetScanner();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const resetScanner = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setScanResult(null);
    setIsProcessing(false);
    setManualCode('');
    setCountdown(0);

    // Repornire scanner dacă e în modul scanner
    if (mode === 'scanner' && scannerContainerRef.current) {
      startScanner();
    }
  }, [mode]);

  // ============================================
  // SCANNER QR (html5-qrcode)
  // ============================================
  const startScanner = useCallback(async () => {
    if (scannerRef.current || !scannerContainerRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-scanner-container');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Camera spate
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Cod QR detectat cu succes
          processCode(decodedText);
        },
        () => {
          // Callback pentru erori de scanare (se ignoră - e normal)
        }
      );

      setScannerActive(true);
    } catch (err) {
      console.error('Scanner start error:', err);
      setScannerActive(false);
    }
  }, [processCode]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Scanner stop error:', err);
      }
      scannerRef.current = null;
      setScannerActive(false);
    }
  }, []);

  // Cleanup la unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Pornire scanner la montare
  useEffect(() => {
    if (mode === 'scanner' && !scanResult) {
      const timer = setTimeout(() => startScanner(), 300);
      return () => clearTimeout(timer);
    }
  }, [mode, scanResult, startScanner]);

  // Schimbare mod
  const switchMode = async (newMode: 'scanner' | 'manual') => {
    if (newMode === 'manual') {
      await stopScanner();
    }
    setMode(newMode);
    setScanResult(null);
    setManualCode('');
  };

  // Submit manual
  const handleManualSubmit = async () => {
    if (manualCode.trim()) {
      processCode(manualCode.trim());
    }
  };

  // ============================================
  // RENDER REZULTAT SCANARE
  // ============================================
  const renderResult = () => {
    if (!scanResult) return null;

    // COD VALID - VERDE
    if (scanResult.type === 'VALID') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 bg-emerald-500 flex items-center justify-center p-6"
        >
          <div className="text-center text-white max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle size={56} className="text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl font-black mb-4"
            >
              ✅ VALID!
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <Ticket size={32} />
                <span className="text-3xl font-bold">DĂ 3 BILETE</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-lg">
                <Mail size={20} />
                <span className="font-mono font-bold text-xl">
                  {scanResult.data.email}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-white/80"
            >
              <Clock size={16} />
              <span>Resetare automată în {countdown}s...</span>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    // COD DEJA FOLOSIT - PORTOCALIU
    if (scanResult.type === 'ALREADY_REDEEMED') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 bg-amber-500 flex items-center justify-center p-6"
        >
          <div className="text-center text-white max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle size={56} className="text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl font-black mb-4"
            >
              ⚠️ COD DEJA FOLOSIT
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6"
            >
              <p className="text-lg mb-2">Acest cod a fost deja revendicat.</p>
              {scanResult.data.redeemed_at && (
                <p className="text-sm opacity-90">
                  Data revendicării: {new Date(scanResult.data.redeemed_at).toLocaleString('ro-RO')}
                </p>
              )}
              <p className="text-sm opacity-90 mt-2">
                Email: <span className="font-mono font-bold">{scanResult.data.email}</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-white/80"
            >
              <Clock size={16} />
              <span>Resetare automată în {countdown}s...</span>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    // COD INVALID - ROȘU
    if (scanResult.type === 'INVALID') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 bg-red-500 flex items-center justify-center p-6"
        >
          <div className="text-center text-white max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <XCircle size={56} className="text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl font-black mb-4"
            >
              ❌ COD INVALID
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg opacity-90 mb-6"
            >
              Codul nu a fost găsit în sistem. Verificați codul și încercați din nou.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-white/80"
            >
              <Clock size={16} />
              <span>Resetare automată în {countdown}s...</span>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ScanLine size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">
                RATBV Ghișeu
                {isDemoMode && (
                  <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                    DEMO
                  </span>
                )}
              </h1>
              <p className="text-slate-400 text-xs">
                {isDemoMode ? 'Mod demonstrativ (localStorage)' : 'Validare coduri QR'}
              </p>
            </div>
          </div>

          {/* Toggle mod */}
          <div className="flex bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => switchMode('scanner')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'scanner'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera size={14} />
              Scanner
            </button>
            <button
              onClick={() => switchMode('manual')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Keyboard size={14} />
              Manual
            </button>
          </div>
        </div>
      </header>

      {/* Conținut principal */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* MOD SCANNER */}
            {mode === 'scanner' && !scanResult && (
              <motion.div
                key="scanner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                {/* Container scanner */}
                <div className="relative mx-auto w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border-4 border-blue-500/50 bg-slate-800 mb-6">
                  <div
                    id="qr-scanner-container"
                    ref={scannerContainerRef}
                    className="w-full h-full"
                  />

                  {/* Overlay cu colțuri */}
                  {!scannerActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                      <div className="text-center">
                        <Camera size={48} className="text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">Se inițializează camera...</p>
                        <p className="text-slate-500 text-xs mt-1">Permiteți accesul la cameră</p>
                      </div>
                    </div>
                  )}

                  {/* Linie scanare animată */}
                  {scannerActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="scan-line absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70" />
                    </div>
                  )}

                  {/* Indicator procesare */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <p className="text-slate-400 text-sm">
                  Poziționați codul QR al călătorului în cadru
                </p>

                {isProcessing && (
                  <p className="text-blue-400 text-sm mt-2 animate-pulse">
                    Se verifică codul...
                  </p>
                )}
              </motion.div>
            )}

            {/* MOD MANUAL */}
            {mode === 'manual' && !scanResult && (
              <motion.div
                key="manual"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Keyboard size={32} className="text-blue-400" />
                  </div>

                  <h2 className="text-white text-lg font-semibold mb-2">
                    Introducere manuală cod
                  </h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Tastați codul de pe ecranul telefonului
                  </p>

                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="RATBV-XXXXX"
                      className="w-full px-4 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white text-center text-xl font-mono tracking-wider placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={11}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleManualSubmit();
                      }}
                    />
                  </div>

                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualCode.trim() || isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg active:scale-95"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Se verifică...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={22} />
                        Verifică cod
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Buton reset manual */}
      {scanResult && countdown > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={resetScanner}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-all"
          >
            <RotateCcw size={16} />
            Resetare acum
          </button>
        </div>
      )}

      {/* Rezultat scanare (overlay fullscreen) */}
      <AnimatePresence>
        {scanResult && renderResult()}
      </AnimatePresence>
    </div>
  );
}
