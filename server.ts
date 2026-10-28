import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
// @ts-ignore
import { sendOTP as sendEmailOTP, verifyOTP as verifyEmailOTP, cleanupExpiredOTPs as cleanupExpiredEmailOTPs } from './lib/email.js';
// @ts-ignore
import { sendOTP as sendSmsOTP, verifyOTP as verifySmsOTP, cleanupExpiredOTPs as cleanupExpiredSmsOTPs } from './lib/sms.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());

// Cleanup periodic
setInterval(() => {
  try {
    cleanupExpiredEmailOTPs();
    cleanupExpiredSmsOTPs();
  } catch (err) {
    console.error('Error in cleanup interval:', err);
  }
}, 10 * 60 * 1000);

// ============================================
// API ROUTES: EMAIL OTP
// ============================================

app.post('/api/email/send', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Adresa de email este obligatorie' });
    }
    const result = await sendEmailOTP(email);
    if (result.success) {
      res.json({
        success: true,
        message: 'Codul de verificare a fost trimis prin email',
        testCode: result.code
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Eroare la trimiterea email-ului' });
  }
});

app.post('/api/email/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email-ul și codul sunt obligatorii' });
    }
    const result = await verifyEmailOTP(email, code);
    if (result.success) {
      res.json({ success: true, verified: true, message: 'Codul este valid' });
    } else {
      res.status(400).json({ success: false, verified: false, error: result.error });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, error: 'Eroare la verificarea codului' });
  }
});

// ============================================
// API ROUTES: SMS OTP
// ============================================

app.post('/api/sms/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Numărul de telefon este obligatoriu' });
    }
    const result = await sendSmsOTP(phone);
    if (result.success) {
      res.json({
        success: true,
        message: 'Codul de verificare a fost trimis prin SMS',
        testCode: result.code
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, error: 'Eroare la trimiterea SMS-ului' });
  }
});

app.post('/api/sms/verify', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, error: 'Telefonul și codul sunt obligatorii' });
    }
    const result = await verifySmsOTP(phone, code);
    if (result.success) {
      res.json({ success: true, verified: true, message: 'Codul este valid' });
    } else {
      res.status(400).json({ success: false, verified: false, error: result.error });
    }
  } catch (error) {
    console.error('Error verifying SMS OTP:', error);
    res.status(500).json({ success: false, error: 'Eroare la verificarea codului' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    email_enabled: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    sms_enabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  });
});

// ============================================
// START SERVER WITH VITE DEV MIDDLEWARE
// ============================================
async function startServer() {
  const server = http.createServer(app);

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false
    },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 RATBV Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
