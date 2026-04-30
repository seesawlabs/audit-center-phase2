import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAudit } from '../context/AuditContext';
import { FACILITIES, TEAM_MEMBERS } from '../data/biomedAudit';

export default function NewAudit() {
  const navigate = useNavigate();
  const location = useLocation();
  const openOcr = location.state?.openOcr || false;
  const { createAudit } = useAudit();
  const [facility, setFacility] = useState('');
  const [auditor, setAuditor] = useState('Alice Abbott');

  function handleStart() {
    if (!facility) return;
    const audit = createAudit({ facility, auditor });
    navigate(`/audit/${audit.id}`, { state: { openOcr } });
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 pt-3 pb-4 border-b border-gray-100">
          <div className="text-xs text-gray-400 flex items-center gap-1 mb-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            Audit Center › BioMed Audit
          </div>
          <div className="text-xl font-medium text-gray-900">Start New BioMed Audit</div>
        </div>

        <div className="flex-1 flex items-center justify-center p-5">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-green-dark px-5 py-4">
              <div className="text-white font-medium">BioMed Audit Setup</div>
              <div className="text-white/60 text-xs mt-0.5">Rendevor Dialysis — Annual Technical Audit</div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Facility</label>
                <select
                  value={facility}
                  onChange={e => setFacility(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
                >
                  <option value="">Select facility...</option>
                  {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Auditor</label>
                <select
                  value={auditor}
                  onChange={e => setAuditor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
                >
                  {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-xs text-green-800 leading-relaxed">
                Your progress will be saved automatically. You can leave and return to this audit at any time from the Audit Center.
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex justify-between">
              <button onClick={() => navigate('/')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleStart}
                disabled={!facility}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${facility ? 'bg-green-mid hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {openOcr ? 'Continue to Upload' : 'Begin Audit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
