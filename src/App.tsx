/**
 * RATBV Brașov - Main Application Router
 * 
 * Routing între pagina publică (formular feedback)
 * și pagina ghișeului (scanner QR).
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TravelerForm from './pages/TravelerForm';
import CashierPage from './pages/CashierPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pagina publică - Formular feedback călători */}
        <Route path="/" element={<TravelerForm />} />
        
        {/* Pagina ghișeului - Scanner & Validare QR */}
        <Route path="/cashier" element={<CashierPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
