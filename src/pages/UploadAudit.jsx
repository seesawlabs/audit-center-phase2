import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FACILITIES } from '../data/biomedAudit';

export default function UploadAudit() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [facility, setFacility] = useState('');
  const [pocNeeded, setPocNeeded] = useState('yes');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 pt-3 pb-4 border-b border-gray-100">
          <div className="text-xs text-gray-400 mb-1">Audit Center › BioMed Audit</div>
          <div className="text-xl font-medium text-gray-900">Upload Completed Audit</div>
        </div>

        <div className="flex-1 flex items-center justify-center p-5 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="bg-green-dark px-5 py-4">
              <div className="text-white font-medium">Upload Custom Audit</div>
              <div className="text-white/55 text-xs mt-0.5">Step {step}/3</div>
            </div>

            {step === 1 && (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Audit name</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-mid" placeholder="e.g. Laurel Highlands / BioMed Audit / Q3 2025" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Auditor</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" value="Alice Abbott" readOnly />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Facility</label>
                  <select value={facility} onChange={e => setFacility(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-mid">
                    <option value="">Select facility...</option>
                    {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Plan of correction needed?</label>
                  <select value={pocNeeded} onChange={e => setPocNeeded(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-mid">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => navigate('/')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button onClick={() => setStep(pocNeeded === 'yes' ? 2 : 3)} disabled={!facility} className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${facility ? 'bg-green-mid hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                    Confirm Facility
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Unmet audit item</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-mid" placeholder="e.g. Safety Audit / Fire Safety — Fire extinguishers are present..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Plan of correction</label>
                  <textarea rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-green-mid" placeholder="Describe the corrective action to be taken..." />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Assign to</label>
                    <select className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-mid">
                      <option>Brian Burke</option>
                      <option>Alice Abbott</option>
                      <option>Jane Smith</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Due date</label>
                    <input type="date" className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-mid" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Status</label>
                    <select className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-mid">
                      <option>Incomplete</option>
                      <option>In Progress</option>
                      <option>Complete</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="emerg" className="w-3.5 h-3.5" />
                  <label htmlFor="emerg" className="text-sm text-gray-500">Mark as emergency</label>
                </div>
                <div className="flex justify-between gap-2 pt-2">
                  <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Back</button>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Add PoC</button>
                    <button onClick={() => setStep(3)} className="px-4 py-2 bg-green-mid text-white rounded-lg text-sm font-medium hover:bg-green-700">Submit</button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="p-5">
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 transition-colors mb-5 ${dragging ? 'border-green-mid bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={dragging ? '#2d6a4f' : '#9ca3af'} strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {file ? (
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-mid">{file.name}</div>
                      <div className="text-xs text-gray-400 mt-1">Ready to upload</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-400">Drag and drop or</div>
                      <label className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
                        Select Files
                        <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                      </label>
                    </>
                  )}
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setStep(pocNeeded === 'yes' ? 2 : 1)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Back</button>
                  <button onClick={() => navigate('/')} disabled={!file} className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${file ? 'bg-green-mid hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                    Upload Audit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
