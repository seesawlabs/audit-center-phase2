import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAudit } from '../context/AuditContext';
import { TEAM_MEMBERS } from '../data/biomedAudit';

export default function PocFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { audits, submitAudit } = useAudit();

  const audit = audits.find(a => a.id === id);
  const flaggedItems = location.state?.flaggedItems || [];

  const [current, setCurrent] = useState(0);
  const [pocData, setPocData] = useState(
    flaggedItems.map((item, i) => ({
      id: 'p' + Date.now() + i,
      section: item.section,
      text: item.text,
      comment: item.comment || '',
      plan: '',
      assignee: '',
      dueDate: '',
      status: 'Incomplete',
      emergency: false,
    }))
  );
  const [submitted, setSubmitted] = useState(false);

  function updateCurrent(field, value) {
    setPocData(prev => prev.map((p, i) => i === current ? { ...p, [field]: value } : p));
  }

  function handleNext() {
    if (current < pocData.length - 1) {
      setCurrent(current + 1);
    } else {
      submitAudit(id, pocData);
      setSubmitted(true);
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(current - 1);
  }

  if (!audit) return null;

  if (flaggedItems.length === 0 || submitted) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 pt-3 pb-4 border-b border-gray-100">
            <div className="text-xs text-gray-400 mb-1">Audit Center › BioMed Audit</div>
            <div className="text-xl font-medium text-gray-900">{audit.name}</div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#27500a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="text-xl font-medium text-gray-900 mb-2">Audit submitted</div>
              <div className="text-sm text-gray-500 leading-relaxed mb-6">
                {audit.name} has been submitted
                {pocData.length > 0 && ` with ${pocData.length} plan of correction item${pocData.length !== 1 ? 's' : ''} assigned`}.
                You can track progress from the Audit Center.
              </div>
              <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-green-mid text-white rounded-xl text-sm font-medium hover:bg-green-700">
                Return to Audit Center
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const item = pocData[current];
  const isLast = current === pocData.length - 1;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 pt-3 pb-4 border-b border-gray-100">
          <div className="text-xs text-gray-400 mb-1">Audit Center › BioMed Audit</div>
          <div className="text-lg font-medium text-gray-900">{audit.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">Auditor: {audit.auditor}</div>
        </div>

        <div className="flex-1 flex items-center justify-center p-5 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-xl">
            {/* Modal header */}
            <div className="bg-green-dark px-5 py-4 flex items-start justify-between">
              <div>
                <div className="text-white font-medium text-base">Plan of Correction</div>
                <div className="text-white/55 text-xs mt-0.5">Item {current + 1} of {pocData.length}</div>
              </div>
              <div className="flex gap-1 mt-1">
                {pocData.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i < current ? 'bg-green-400 w-5' : i === current ? 'bg-white w-5' : 'bg-white/25 w-5'}`} />
                ))}
              </div>
            </div>

            {/* Modal body */}
            <div className="p-5">
              {/* Unmet item */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-4">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Unmet audit item</div>
                <div className="text-xs text-gray-500 mb-1">{item.section}</div>
                <div className="text-sm font-medium text-gray-900 leading-snug">{item.text}</div>
                {item.comment && (
                  <div className="mt-2.5 pt-2.5 border-t border-gray-200 flex gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" className="flex-shrink-0 mt-0.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    <span className="text-xs text-gray-500 italic">{item.comment}</span>
                  </div>
                )}
              </div>

              {/* Plan of correction */}
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1.5">Plan of correction</label>
                <textarea
                  rows={4}
                  value={item.plan}
                  onChange={e => updateCurrent('plan', e.target.value)}
                  placeholder="Describe the corrective action to be taken..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 resize-none focus:outline-none focus:border-green-mid"
                />
              </div>

              {/* 3-col row */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Assign to</label>
                  <select value={item.assignee} onChange={e => updateCurrent('assignee', e.target.value)} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid">
                    <option value="">Select...</option>
                    {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Due date</label>
                  <input type="date" value={item.dueDate} onChange={e => updateCurrent('dueDate', e.target.value)} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Status</label>
                  <select value={item.status} onChange={e => updateCurrent('status', e.target.value)} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid">
                    <option>Incomplete</option>
                    <option>In Progress</option>
                    <option>Complete</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="emergency" checked={item.emergency} onChange={e => updateCurrent('emergency', e.target.checked)} className="w-3.5 h-3.5 cursor-pointer" />
                <label htmlFor="emergency" className="text-sm text-gray-500 cursor-pointer">Mark as emergency</label>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {isLast ? 'Last item' : <><span className="font-medium text-gray-700">{pocData.length - current - 1}</span> item{pocData.length - current - 1 !== 1 ? 's' : ''} remaining</>}
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrev} disabled={current === 0} className={`px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 ${current === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}>Back</button>
                <button onClick={handleNext} className="px-4 py-1.5 bg-green-mid text-white rounded-lg text-sm font-medium hover:bg-green-700">
                  {isLast ? 'Submit Audit' : 'Next item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
