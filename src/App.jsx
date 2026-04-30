import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuditProvider } from './context/AuditContext';
import Home from './pages/Home';
import NewAudit from './pages/NewAudit';
import AuditForm from './pages/AuditForm';
import PocFlow from './pages/PocFlow';
import PrintAudit from './pages/PrintAudit';

export default function App() {
  return (
    <AuditProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/audit/new" element={<NewAudit />} />
          <Route path="/audit/:id" element={<AuditForm />} />
          <Route path="/audit/:id/poc" element={<PocFlow />} />
          <Route path="/audit/:id/print" element={<PrintAudit />} />
          <Route path="/print/blank" element={<PrintAudit />} />
        </Routes>
      </BrowserRouter>
    </AuditProvider>
  );
}
