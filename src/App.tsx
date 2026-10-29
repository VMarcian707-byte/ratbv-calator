/**
 * RATBV Brașov - Main Application Router
 * 
 * Formular public feedback călători
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TravelerForm from './pages/TravelerForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pagina publică - Formular feedback călători */}
        <Route path="/" element={<TravelerForm />} />
        <Route path="*" element={<TravelerForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
