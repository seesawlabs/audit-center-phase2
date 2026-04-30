import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useAudit } from '../context/AuditContext';
import { FACILITIES, TEAM_MEMBERS } from '../data/biomedAudit';

const NO_RE = /^(no|not met|n|failed|unmet|f)$/i;
const SKIP_RE = /^(yes|y|met|pass|ok|n\/a|na|s|satisfactory|compliant|complete)$/i;
const AUDITOR = 'Alice Abbott';
const TOTAL_STEPS = 3;

function makeId() {
  return 'p' + Date.now() + '_' + Math.floor(Math.random() * 100000);
}

function emptyItem() {
  return { id: makeId(), text: '', section: '', plan: '', assignee: '', dueDate: '', status: 'incomplete', emergency: false, fromFile: false };
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });

        let facility = '';
        outer:
        for (const sheetName of wb.SheetNames) {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
          for (const row of rows.slice(0, 15)) {
            for (const cell of row) {
              const s = String(cell).trim();
              const exact = FACILITIES.find(f => s.toLowerCase() === f.toLowerCase());
              if (exact) { facility = exact; break outer; }
              const m = s.match(/^(?:facility|location|site)[:\s]+(.+)$/i);
              if (m) {
                const found = FACILITIES.find(f => f.toLowerCase() === m[1].trim().toLowerCase());
                if (found) { facility = found; break outer; }
              }
            }
          }
        }

        const items = [];
        const seen = new Set();
        wb.SheetNames.forEach(sheetName => {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
          rows.forEach((row, ri) => {
            if (ri === 0) return;
            row.forEach((cell, ci) => {
              if (!NO_RE.test(String(cell).trim())) return;
              const candidates = row
                .map((c, i) => ({ s: String(c).trim(), i }))
                .filter(({ s, i }) =>
                  i !== ci && s.length > 8 && !NO_RE.test(s) && !SKIP_RE.test(s) && !/^\d+(\.\d+)?%?$/.test(s)
                );
              const best = candidates.sort((a, b) => b.s.length - a.s.length)[0];
              if (best && !seen.has(best.s)) {
                seen.add(best.s);
                items.push({
                  id: makeId(),
                  text: best.s,
                  section: sheetName !== 'Sheet1' ? sheetName : '',
                  plan: '',
                  assignee: '',
                  dueDate: '',
                  status: 'incomplete',
                  emergency: false,
                  fromFile: true,
                });
              }
            });
          });
        });

        resolve({ facility, items });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function PocItemForm({ item, index, onChange, onRemove }) {
  return (
    <div className="space-y-4">
      {item.fromFile && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-700">Detected from uploaded file</span>
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Unmet audit item</label>
        <input
          value={item.text}
          onChange={e => onChange('text', e.target.value)}
          placeholder="e.g. Fire extinguishers are present and visible."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Corrective action</label>
        <textarea
          rows={3}
          value={item.plan}
          onChange={e => onChange('plan', e.target.value)}
          placeholder="Describe the corrective action to be taken..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 resize-none focus:outline-none focus:border-green-mid"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Assign to</label>
          <select
            value={item.assignee}
            onChange={e => onChange('assignee', e.target.value)}
            className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
          >
            <option value="">Select...</option>
            {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Due date</label>
          <input
            type="date"
            value={item.dueDate}
            onChange={e => onChange('dueDate', e.target.value)}
            className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Status</label>
          <select
            value={item.status}
            onChange={e => onChange('status', e.target.value)}
            className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
          >
            <option value="incomplete">Incomplete</option>
            <option value="in-progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={item.emergency}
          onChange={e => onChange('emergency', e.target.checked)}
          className="w-3.5 h-3.5 cursor-pointer"
        />
        <span className="text-sm text-gray-500">Mark as emergency</span>
      </label>

      <div className="pt-1">
        <button
          onClick={onRemove}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Remove this item
        </button>
      </div>
    </div>
  );
}

export default function UploadAuditModal({ onClose }) {
  const { createUploadedAudit } = useAudit();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [facility, setFacility] = useState('');
  const [facilityDetected, setFacilityDetected] = useState(false);
  const [auditName, setAuditName] = useState('');
  const [pocItems, setPocItems] = useState([]);
  const [parsedItemCount, setParsedItemCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  function handleFacilityChange(val) {
    const prevAuto = facility ? `${facility} — BioMed Audit` : '';
    setFacility(val);
    setAuditName(prev => (!prev || prev === prevAuto) ? (val ? `${val} — BioMed Audit` : '') : prev);
  }

  async function handleFile(f) {
    if (!f) return;
    setFile(f);
    setParseError(null);
    setParsing(true);
    setFacility('');
    setAuditName('');
    setFacilityDetected(false);
    setPocItems([]);
    setParsedItemCount(0);
    setActiveTab(0);
    try {
      const { facility: detFacility, items } = await parseExcel(f);
      setParsedItemCount(items.length);
      setPocItems(items);
      if (detFacility) {
        setFacility(detFacility);
        setAuditName(`${detFacility} — BioMed Audit`);
        setFacilityDetected(true);
      }
    } catch {
      setParseError('Could not parse this file. Please ensure it is a valid .xlsx or .xls file.');
      setFile(null);
    } finally {
      setParsing(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function updatePoc(id, field, val) {
    setPocItems(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
  }

  function removePocItem(idx) {
    setPocItems(prev => {
      const next = prev.filter((_, i) => i !== idx);
      setActiveTab(next.length === 0 ? 0 : Math.min(idx, next.length - 1));
      return next;
    });
  }

  function addPocItem() {
    setPocItems(prev => {
      setActiveTab(prev.length);
      return [...prev, emptyItem()];
    });
  }

  function handleSubmit() {
    createUploadedAudit({
      name: auditName.trim() || `${facility} — BioMed Audit`,
      facility,
      auditor: AUDITOR,
      pocItems: pocItems.filter(p => p.text.trim()),
    });
    onClose();
  }

  const canContinue1 = !!file && !parsing && !parseError;
  const canContinue2 = !!facility && !!auditName.trim();

  function goBack() {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="bg-green-dark px-5 py-4 flex items-start justify-between flex-shrink-0 rounded-t-2xl">
          <div>
            <div className="text-white font-medium text-base">Upload Completed Audit</div>
            <div className="text-white/60 text-xs mt-0.5">Step {step} of {TOTAL_STEPS}</div>
          </div>
          <div className="flex gap-1.5 mt-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-5 rounded-full transition-all ${
                  i < step - 1 ? 'bg-green-400' : i === step - 1 ? 'bg-white' : 'bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="p-5">
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${
                  dragging ? 'border-green-mid bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {parsing ? (
                  <>
                    <div className="w-7 h-7 border-2 border-green-mid border-t-transparent rounded-full animate-spin" />
                    <div className="text-sm text-gray-400">Reading audit file...</div>
                  </>
                ) : file ? (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="1.5">
                      <path d="M9 12h6M9 16h4M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                    </svg>
                    <div className="text-sm font-medium text-green-mid text-center">{file.name}</div>
                    <label className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 cursor-pointer hover:bg-gray-50">
                      Change file
                      <input type="file" accept=".xlsx,.xls" onChange={e => handleFile(e.target.files[0])} className="hidden" />
                    </label>
                  </>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragging ? '#2d6a4f' : '#9ca3af'} strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <div className="text-sm text-gray-400 text-center">Drag and drop your completed audit here, or</div>
                    <label className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
                      Select file
                      <input type="file" accept=".xlsx,.xls" onChange={e => handleFile(e.target.files[0])} className="hidden" />
                    </label>
                    <div className="text-xs text-gray-400">Accepts .xlsx and .xls</div>
                  </>
                )}
              </div>

              {parseError && (
                <div className="mt-3 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                  {parseError}
                </div>
              )}

              {file && !parsing && !parseError && (
                <div className="mt-3 space-y-2">
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-2.5">
                    {facilityDetected ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2.5" className="flex-shrink-0">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span className="text-xs text-gray-700">
                          Facility detected: <span className="font-medium text-green-mid">{facility}</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" className="flex-shrink-0">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span className="text-xs text-amber-800">Facility not detected — you'll select it in the next step</span>
                      </>
                    )}
                  </div>

                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-2.5">
                    {parsedItemCount > 0 ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5" className="flex-shrink-0">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <span className="text-xs text-gray-700">
                          <span className="font-medium text-amber-700">{parsedItemCount} unmet item{parsedItemCount !== 1 ? 's' : ''}</span> detected — will be added as Plans of Correction
                        </span>
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2.5" className="flex-shrink-0">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span className="text-xs text-gray-700">No unmet items detected — audit appears fully compliant</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Confirm audit info */}
          {step === 2 && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Facility</label>
                <select
                  value={facility}
                  onChange={e => handleFacilityChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-green-mid ${
                    !facility ? 'border-amber-300 text-gray-400' : 'border-gray-200 text-gray-800'
                  }`}
                >
                  <option value="">Select facility...</option>
                  {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                {!facilityDetected && (
                  <p className="mt-1 text-xs text-amber-600">Not detected in file — please select manually.</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Audit name</label>
                <input
                  value={auditName}
                  onChange={e => setAuditName(e.target.value)}
                  placeholder="e.g. Laurel Highlands — BioMed Audit"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Auditor</label>
                <input
                  value={AUDITOR}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-default"
                />
              </div>
            </div>
          )}

          {/* Step 3: Plans of Correction (tabbed) */}
          {step === 3 && (
            <>
              {/* Tab bar */}
              <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
                <div className="flex items-end px-5 pt-3 overflow-x-auto gap-0">
                  {pocItems.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(idx)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                        activeTab === idx
                          ? 'border-green-mid text-green-mid'
                          : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      {item.fromFile && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      )}
                      Item {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={addPocItem}
                    className={`flex items-center gap-1 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors border-transparent text-green-mid hover:bg-green-50`}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add PoC
                  </button>
                </div>
              </div>

              {/* Tab content */}
              <div className="p-5">
                {pocItems.length === 0 ? (
                  <div className="py-10 flex flex-col items-center gap-2 text-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                      <path d="M9 12h6M9 16h4M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                    </svg>
                    <p className="text-sm text-gray-400">No unmet items were detected in this audit.</p>
                    <p className="text-xs text-gray-400">
                      Use <span className="text-green-mid font-medium">+ Add PoC</span> above to add items manually.
                    </p>
                  </div>
                ) : pocItems[activeTab] ? (
                  <PocItemForm
                    item={pocItems[activeTab]}
                    index={activeTab}
                    onChange={(field, val) => updatePoc(pocItems[activeTab].id, field, val)}
                    onRemove={() => removePocItem(activeTab)}
                  />
                ) : null}
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <button
            onClick={step === 1 ? onClose : goBack}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              disabled={!canContinue1}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                !canContinue1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-mid hover:bg-green-700'
              }`}
            >
              Continue
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              disabled={!canContinue2}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                !canContinue2 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-mid hover:bg-green-700'
              }`}
            >
              Continue
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-mid hover:bg-green-700 transition-colors"
            >
              Upload &amp; Submit
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
