import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAudit } from '../context/AuditContext';
import { BIOMED_SECTIONS, MACH_TYPE_OPTIONS, EQUIP_OPTIONS } from '../data/biomedAudit';
import OcrUploadModal from '../components/OcrUploadModal';

function groupIsComplete(group, answers) {
  return group.questions.every(q => {
    if (q.type === 'calculated' || q.type === 'machine-row' || q.type === 'equipment-row' || q.type === 'equipment-extra' || q.type === 'machine-extra') return true;
    return answers[q.id] !== undefined && answers[q.id] !== '';
  });
}

function sectionIsComplete(section, answers) {
  return section.groups.every(g => groupIsComplete(g, answers));
}

export default function AuditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { audits, updateAudit } = useAudit();

  const audit = audits.find(a => a.id === id);
  const [answers, setAnswers] = useState(audit?.answers || {});
  const [sectionIdx, setSectionIdx] = useState(0);
  const [groupIdx, setGroupIdx] = useState(0);
  const [savedAt, setSavedAt] = useState(null);
  const [hiddenQIds, setHiddenQIds] = useState(new Set());
  const [showOcr, setShowOcr] = useState(location.state?.openOcr || false);
  const hideQuestion = id => setHiddenQIds(prev => new Set([...prev, id]));

  const sections = BIOMED_SECTIONS;
  const currentSection = sections[sectionIdx];
  const currentGroup = currentSection.groups[groupIdx];

  const completeSections = sections.filter(s => sectionIsComplete(s, answers)).length;
  const allComplete = completeSections === sections.length;

  useEffect(() => {
    const timer = setInterval(() => {
      updateAudit(id, { answers, sectionsComplete: completeSections });
      setSavedAt(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, [answers, completeSections]);

  function setAnswer(qid, val) {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  }

  function getCalcValue(q) {
    if (!q.formula) return null;
    return q.formula(answers);
  }

  function getFlaggedItems() {
    const items = [];
    sections.forEach(section => {
      section.groups.forEach(group => {
        group.questions.forEach(q => {
          if (q.type === 'yn' && answers[q.id] === 'no') {
            items.push({ section: `${section.name} / ${group.name}`, text: q.text, qid: q.id, comment: answers[q.id + '_comment'] || '' });
          }
          if (q.type === 'machine-row' && answers[q.id]) {
            const a = answers[q.id];
            const loc = `${section.name} / ${group.name}`;
            if (a.diasafe === 'no') items.push({ section: loc, text: `${q.text} — Diasafe not current`, qid: `${q.id}_diasafe` });
            if (a.elecSafety === 'no') items.push({ section: loc, text: `${q.text} — Electrical Safety not current`, qid: `${q.id}_elec` });
            if (a.wos === 'no') items.push({ section: loc, text: `${q.text} — Work Orders not in Binder`, qid: `${q.id}_wos` });
          }
        });
      });
    });
    return items;
  }

  function autoComplete() {
    const machineRow = (num) => ({
      serial: num > 17 ? `5K0S-${String(num).padStart(3, '0')}X` : `3T0S-1225${String(num).padStart(2, '0')}`,
      machType: num > 17 ? 'Fresenius 2008K' : 'Fresenius 2008T BiBag',
      saDates: '09/15/2024',
      annualDates: '03/15/2025',
      diasafe: 'yes',
      elecSafety: 'yes',
      wos: 'yes',
      tag: `35${String(27 + num).padStart(2, '0')}`,
      hours: num > 17 ? String(20000 + num * 800) : String(500 + num * 100),
    });

    const equipRow = (qid) => {
      if (qid.startsWith('wt_ro') || qid.startsWith('ro')) {
        const n = parseInt(qid.replace('wt_ro', '').replace('ro', ''));
        const models = ['4400', '700 Series', 'Millennium'];
        return { manufacturer: 'MarCor/Evoqua', model: models[(n - 1) % 3], serial: `RO-SN-${1000 + n}`, asset: String(3430 + n), hours: String(14000 - n * 500) };
      }
      if (qid === 'chair_iso') return { manufacturer: 'Drive', model: 'D577', serial: '11J1801023362', asset: '3422', hours: '' };
      if (qid.startsWith('chair')) {
        const n = parseInt(qid.replace('chair', ''));
        const mfr = n % 3 === 0 ? 'Lumex' : 'WinCo';
        return { manufacturer: mfr, model: mfr === 'Lumex' ? '6950' : '6530', serial: `CH-SN-${3000 + n}`, asset: String(3420 + n), hours: '' };
      }
      if (qid === 'acid_mixer') return { manufacturer: 'Fresenius', model: '', serial: 'DA132106065', asset: '3436', hours: '' };
      if (qid === 'bicarb_mixer') return { manufacturer: 'Ameriwater', model: '', serial: '9516763', asset: '3437', hours: '' };
      if (qid === 'meter1') return { manufacturer: 'Myron L', model: '', serial: '5322959', asset: '3439', hours: '' };
      if (qid === 'meter2') return { manufacturer: 'Myron L', model: '', serial: '569057', asset: '3440', hours: '' };
      return { manufacturer: '', model: '', serial: '', asset: '', hours: '' };
    };

    const textMap = {
      q2_loc: 'Water Room', q4_loc: 'Main Hallway', q6_loc: 'Treatment Floor',
      q12: 'Graduated cylinder',
      q20_loc: 'Water Treatment Room', q23_loc: 'Water Treatment Room',
      q26: '6 staff attended',
      q36: '20 stations, 20 machines',
      q38: '03/15/2025',
      q43: 'Frank Fletcher — (412) 555-0192', q44: 'Water Solutions Inc. — (800) 555-0143',
      q45: 'RO Water: 01/15/2025 | Tap Water: 01/15/2025',
      q55: 'Type: Bicarb Mixing | Match: Yes | Spare: On Hand',
      q138: 'Annual audit completed. All systems operating within normal parameters.',
    };

    const numMap = { q9: '2', q13: '15', q14: '15', q15: '5', q17: '400', q18: '10' };

    const next = { ...answers };
    sections.forEach(section => {
      section.groups.forEach(group => {
        group.questions.forEach(q => {
          if (hiddenQIds.has(q.id)) return;
          if (q.type === 'calculated' || q.type === 'equipment-extra' || q.type === 'machine-extra') return;
          if (q.type === 'yn') next[q.id] = 'yes';
          else if (q.type === 'number') next[q.id] = numMap[q.id] ?? '1';
          else if (q.type === 'text') next[q.id] = textMap[q.id] ?? 'N/A';
          else if (q.type === 'machine-row') next[q.id] = machineRow(parseInt(q.id.replace('mach', '')));
          else if (q.type === 'equipment-row') next[q.id] = equipRow(q.id);
        });
      });
    });
    setAnswers(next);
  }

  function handleSaveExit() {
    const flagged = getFlaggedItems();
    const existingByQid = Object.fromEntries(
      (audit.pocItems || []).filter(p => p.qid).map(p => [p.qid, p])
    );
    const manualItems = (audit.pocItems || []).filter(p => !p.qid);
    const pocItems = [
      ...manualItems,
      ...flagged.map(item => existingByQid[item.qid] || {
        id: 'p' + Date.now() + Math.random(),
        qid: item.qid,
        section: item.section,
        text: item.text,
        comment: item.comment,
        plan: '',
        assignee: '',
        dueDate: '',
        status: 'incomplete',
        emergency: false,
      }),
    ];
    updateAudit(id, { answers, sectionsComplete: completeSections, pocItems });
    navigate('/');
  }

  function handleSubmit() {
    updateAudit(id, { answers, sectionsComplete: completeSections });
    navigate(`/audit/${id}/poc`, { state: { flaggedItems: getFlaggedItems() } });
  }

  function goNext() {
    if (groupIdx < currentSection.groups.length - 1) {
      setGroupIdx(groupIdx + 1);
    } else if (sectionIdx < sections.length - 1) {
      setSectionIdx(sectionIdx + 1);
      setGroupIdx(0);
    }
  }

  function goPrev() {
    if (groupIdx > 0) {
      setGroupIdx(groupIdx - 1);
    } else if (sectionIdx > 0) {
      setSectionIdx(sectionIdx - 1);
      setGroupIdx(sections[sectionIdx - 1].groups.length - 1);
    }
  }

  const isFirst = sectionIdx === 0 && groupIdx === 0;
  const isLast = sectionIdx === sections.length - 1 && groupIdx === currentSection.groups.length - 1;

  if (!audit) return <div className="p-8 text-gray-500">Audit not found.</div>;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="px-5 pt-3 border-b border-gray-100 flex-shrink-0">
          <div className="text-xs text-gray-400 flex items-center gap-1 mb-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            Audit Center › BioMed Audit
          </div>
          <div className="flex items-start justify-between pb-2.5">
            <div>
              <div className="text-lg font-medium text-gray-900">{audit.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Started {audit.createdAt} · Auditor: {audit.auditor}
                {savedAt && ` · Saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={handleSaveExit} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50">
                Save &amp; Exit
              </button>
              <button onClick={() => navigate(`/audit/${id}/print`)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print
              </button>
              <button onClick={() => setShowOcr(true)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Upload Paper Audit
              </button>
              <button onClick={autoComplete} className="px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                Auto-Complete
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allComplete}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity ${allComplete ? 'bg-green-mid hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Submit Audit
              </button>
            </div>
          </div>

          {/* Section tabs */}
          <div className="flex overflow-x-auto">
            {sections.map((s, i) => {
              const done = sectionIsComplete(s, answers);
              const active = i === sectionIdx;
              return (
                <div
                  key={s.id}
                  onClick={() => { setSectionIdx(i); setGroupIdx(0); }}
                  className={`px-3 py-2 text-xs cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors
                    ${active ? 'border-green-mid text-gray-900 font-medium' : done ? 'border-transparent text-green-mid' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  {done && !active && (
                    <div className="w-3.5 h-3.5 rounded-full bg-green-mid flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                  {s.name}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Group nav */}
          <div className="w-48 border-r border-gray-100 overflow-y-auto flex-shrink-0 py-3">
            <div className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">{currentSection.name}</div>
            {currentSection.groups.map((g, i) => {
              const done = groupIsComplete(g, answers);
              const active = i === groupIdx;
              const hasNo = g.questions.some(q => answers[q.id] === 'no');
              return (
                <div
                  key={g.id}
                  onClick={() => setGroupIdx(i)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer border-l-2 transition-colors
                    ${active ? 'border-green-mid bg-green-50 text-green-mid font-medium' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasNo ? 'bg-red-400' : done ? 'bg-green-mid' : active ? 'bg-green-mid' : 'bg-gray-200'}`} />
                  {g.name}
                </div>
              );
            })}
          </div>

          {/* Question area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="text-base font-medium text-gray-900">{currentGroup.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">Group {groupIdx + 1} of {currentSection.groups.length} · {currentSection.name}</div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
              {currentGroup.questions.filter(q => !hiddenQIds.has(q.id)).map(q => (
                <QuestionCard key={q.id} q={q} answer={answers[q.id]} comment={answers[q.id + '_comment']} photos={answers[q.id + '_photos'] || []} calcValue={q.type === 'calculated' ? getCalcValue(q) : null} onAnswer={setAnswer} onRemove={['machine-row', 'equipment-row'].includes(q.type) ? () => hideQuestion(q.id) : null} />
              ))}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {currentSection.groups.map((g, i) => {
                    const done = groupIsComplete(g, answers);
                    return (
                      <div key={g.id} className={`rounded-full transition-all ${i === groupIdx ? 'w-4 h-1.5 bg-green-mid' : done ? 'w-1.5 h-1.5 bg-green-mid' : 'w-1.5 h-1.5 bg-gray-200'}`} />
                    );
                  })}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Auto-saved
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={goPrev} disabled={isFirst} className={`px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 ${isFirst ? 'opacity-30 cursor-not-allowed' : ''}`}>Back</button>
                <button onClick={goNext} disabled={isLast} className={`px-3 py-1.5 bg-green-mid text-white rounded-lg text-xs font-medium hover:bg-green-700 ${isLast ? 'opacity-30 cursor-not-allowed' : ''}`}>
                  {groupIdx === currentSection.groups.length - 1 ? 'Next section' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showOcr && (
        <OcrUploadModal
          existingAnswers={answers}
          onConfirm={imported => { setAnswers(imported); setShowOcr(false); }}
          onClose={() => setShowOcr(false)}
        />
      )}
    </div>
  );
}



function PhotoUpload({ photos = [], onChange }) {
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;
    Promise.all(
      fileArray.map(file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve({ url: e.target.result, name: file.name });
        reader.readAsDataURL(file);
      }))
    ).then(newPhotos => onChange([...photos, ...newPhotos]));
  };

  return (
    <div>
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative w-16 h-16">
              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover rounded-lg border border-gray-200" />
              <button
                onClick={() => onChange(photos.filter((_, i) => i !== idx))}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => cameraRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
          Take Photo
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Upload Photo
        </button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }} />
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

function QuestionCard({ q, answer, comment, photos, calcValue, onAnswer, onRemove }) {
  if (q.type === 'calculated') {
    return (
      <div className="rounded-xl p-4 bg-gray-50">
        <div className="text-sm text-gray-700 mb-3">{q.text}</div>
        <div className={`text-2xl font-medium ${calcValue ? 'text-green-mid' : 'text-gray-300'}`}>
          {calcValue || '—'}
        </div>
        <div className="text-xs text-gray-400 mt-1">Calculated automatically from values above</div>
      </div>
    );
  }

  if (q.type === 'machine-row') return <MachineRowCard q={q} answer={answer} onAnswer={onAnswer} onRemove={onRemove} />;
  if (q.type === 'equipment-row') return <EquipmentRowCard q={q} answer={answer} onAnswer={onAnswer} onRemove={onRemove} />;
  if (q.type === 'equipment-extra') return <EquipmentExtraCard q={q} answer={answer} onAnswer={onAnswer} />;
  if (q.type === 'machine-extra') return <MachineExtraCard q={q} answer={answer} onAnswer={onAnswer} />;

  return (
    <div className="py-3">
      <div className="text-sm text-gray-800 mb-3 leading-relaxed">{q.text}</div>

      {q.type === 'yn' && (
        <>
          <div className="flex gap-2">
            {['yes', 'no', 'na'].map(opt => {
              const labels = { yes: 'Yes', no: 'No', na: 'N/A' };
              const selected = answer === opt;
              const styles = {
                yes: selected ? 'bg-green-100 border-green-mid text-green-800' : 'border-gray-200 text-gray-500 hover:border-gray-300',
                no: selected ? 'bg-red-50 border-red-400 text-red-800' : 'border-gray-200 text-gray-500 hover:border-gray-300',
                na: selected ? 'bg-gray-100 border-gray-400 text-gray-700' : 'border-gray-200 text-gray-500 hover:border-gray-300',
              };
              return (
                <button key={opt} onClick={() => onAnswer(q.id, answer === opt ? undefined : opt)} className={`flex-1 py-2 border rounded-lg text-sm font-medium transition-all ${styles[opt]}`}>
                  {labels[opt]}
                </button>
              );
            })}
          </div>
          {answer === 'no' && (
            <div className="mt-2.5 space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                This item will be added to the plan of correction. Any comment left below will be included.
              </div>
              <PhotoUpload
                photos={photos}
                onChange={newPhotos => onAnswer(q.id + '_photos', newPhotos)}
              />
            </div>
          )}
          {answer && (
            <textarea
              value={comment || ''}
              onChange={e => onAnswer(q.id + '_comment', e.target.value)}
              placeholder="Add a comment (optional)..."
              rows={2}
              className="w-full mt-2.5 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 resize-none focus:outline-none focus:border-green-mid"
            />
          )}
        </>
      )}

      {q.type === 'number' && (
        <input
          type="number"
          value={answer || ''}
          onChange={e => onAnswer(q.id, e.target.value)}
          placeholder="Enter value..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
        />
      )}

      {q.type === 'text' && (
        <textarea
          value={answer || ''}
          onChange={e => onAnswer(q.id, e.target.value)}
          placeholder="Enter your response..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 resize-none focus:outline-none focus:border-green-mid"
        />
      )}
    </div>
  );
}

function RowInput({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-green-mid"
      />
    </div>
  );
}

function RowDropdown({ label, value, onChange, options, disabled = false }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-green-mid bg-white disabled:bg-gray-50 disabled:text-gray-400"
      >
        <option value="">— Select —</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function RowSelect({ label, value, onChange }) {
  const sel = {
    yes: 'bg-green-100 border-green-mid text-green-800',
    no: 'bg-red-50 border-red-400 text-red-700',
    na: 'bg-gray-100 border-gray-400 text-gray-700',
  };
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex gap-1">
        {['yes', 'no', 'na'].map(opt => (
          <button
            key={opt}
            onClick={() => onChange(value === opt ? '' : opt)}
            className={`flex-1 py-1 border rounded text-xs font-medium transition-all ${value === opt ? sel[opt] : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
          >
            {opt === 'na' ? 'N/A' : opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

function MachineRowCard({ q, answer, onAnswer, onRemove }) {
  const ans = answer || {};
  const upd = (field, val) => onAnswer(q.id, { ...ans, [field]: val });
  const machTypes = q.machTypeOptions || [];
  return (
    <div className="py-3 relative">
      {onRemove && (
        <button onClick={onRemove} title="Remove machine" className="absolute top-3 right-0 text-gray-300 hover:text-red-400 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
      <div className="text-sm font-semibold text-gray-800 mb-3">{q.text}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <RowInput label="Serial #" value={ans.serial || ''} onChange={v => upd('serial', v)} />
        {machTypes.length > 0
          ? <RowDropdown label="Machine Type" value={ans.machType || ''} onChange={v => upd('machType', v)} options={machTypes} />
          : <RowInput label="Machine Type" value={ans.machType || ''} onChange={v => upd('machType', v)} />}
        <RowInput label="SA Dates" value={ans.saDates || ''} onChange={v => upd('saDates', v)} placeholder="MM/DD/YYYY" />
        <RowInput label="Annual Dates" value={ans.annualDates || ''} onChange={v => upd('annualDates', v)} placeholder="MM/DD/YYYY" />
        <RowSelect label="Diasafe" value={ans.diasafe || ''} onChange={v => upd('diasafe', v)} />
        <RowSelect label="Elec Safety" value={ans.elecSafety || ''} onChange={v => upd('elecSafety', v)} />
        <RowSelect label="WOs in Binder" value={ans.wos || ''} onChange={v => upd('wos', v)} />
        <RowInput label="Rendevor Tag #" value={ans.tag || ''} onChange={v => upd('tag', v)} />
        <RowInput label="Machine Hours" value={ans.hours || ''} onChange={v => upd('hours', v)} type="number" />
      </div>
      {[['diasafe', 'Diasafe'], ['elecSafety', 'Electrical Safety'], ['wos', 'Work Orders in Binder']].map(([field, label]) =>
        ans[field] === 'no' ? (
          <div key={field} className="mt-3 px-3 py-2.5 bg-red-50 rounded-lg">
            <div className="text-xs text-red-700 mb-2 font-medium">{label} — attach photo evidence</div>
            <PhotoUpload
              photos={ans[field + '_photos'] || []}
              onChange={newPhotos => upd(field + '_photos', newPhotos)}
            />
          </div>
        ) : null
      )}
    </div>
  );
}

function EquipmentRowCard({ q, answer, onAnswer, onRemove }) {
  const ans = answer || {};
  const mfrOpts = q.manufacturerOptions || [];
  const modelOpts = q.modelOptions || {};
  const upd = (field, val) => {
    const next = { ...ans, [field]: val };
    if (field === 'manufacturer') next.model = '';
    onAnswer(q.id, next);
  };
  const availableModels = modelOpts[ans.manufacturer] || [];
  return (
    <div className="py-3 relative">
      {onRemove && (
        <button onClick={onRemove} title="Remove item" className="absolute top-3 right-0 text-gray-300 hover:text-red-400 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
      <div className="text-sm font-semibold text-gray-800 mb-3">{q.text}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {mfrOpts.length > 0
          ? <RowDropdown label="Manufacturer" value={ans.manufacturer || ''} onChange={v => upd('manufacturer', v)} options={mfrOpts} />
          : <RowInput label="Manufacturer" value={ans.manufacturer || ''} onChange={v => upd('manufacturer', v)} />}
        {availableModels.length > 0
          ? <RowDropdown label="Model #" value={ans.model || ''} onChange={v => upd('model', v)} options={availableModels} />
          : <RowInput label="Model #" value={ans.model || ''} onChange={v => upd('model', v)} />}
        <RowInput label="Serial #" value={ans.serial || ''} onChange={v => upd('serial', v)} />
        <RowInput label="Asset #" value={ans.asset || ''} onChange={v => upd('asset', v)} />
        <RowInput label="Hours" value={ans.hours || ''} onChange={v => upd('hours', v)} type="number" />
      </div>
    </div>
  );
}

function AddMoreButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-green-mid hover:text-green-mid transition-colors flex items-center justify-center gap-1.5"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      {label}
    </button>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors"
      title="Remove"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  );
}

function EquipmentExtraCard({ q, answer, onAnswer }) {
  const rows = answer || [];
  const allMfr = EQUIP_OPTIONS.all.manufacturerOptions;
  const allModels = EQUIP_OPTIONS.all.modelOptions;
  const add = () => onAnswer(q.id, [...rows, { description: '', manufacturer: '', model: '', serial: '', asset: '', hours: '' }]);
  const upd = (idx, field, val) => {
    const next = rows.map((r, i) => {
      if (i !== idx) return r;
      const updated = { ...r, [field]: val };
      if (field === 'manufacturer') updated.model = '';
      return updated;
    });
    onAnswer(q.id, next);
  };
  const remove = (idx) => onAnswer(q.id, rows.filter((_, i) => i !== idx));
  return (
    <div className="space-y-3">
      {rows.map((row, idx) => {
        const availableModels = allModels[row.manufacturer] || [];
        return (
          <div key={idx} className="bg-gray-50 rounded-xl p-4 relative">
            <RemoveButton onClick={() => remove(idx)} />
            <div className="text-xs font-medium text-gray-500 mb-3">Additional item {idx + 1}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="col-span-2">
                <RowInput label="Description" value={row.description || ''} onChange={v => upd(idx, 'description', v)} placeholder="e.g. Portable RO, Acid Mixer" />
              </div>
              <RowDropdown label="Manufacturer" value={row.manufacturer || ''} onChange={v => upd(idx, 'manufacturer', v)} options={allMfr} />
              {availableModels.length > 0
                ? <RowDropdown label="Model #" value={row.model || ''} onChange={v => upd(idx, 'model', v)} options={availableModels} />
                : <RowInput label="Model #" value={row.model || ''} onChange={v => upd(idx, 'model', v)} />}
              <RowInput label="Serial #" value={row.serial || ''} onChange={v => upd(idx, 'serial', v)} />
              <RowInput label="Asset #" value={row.asset || ''} onChange={v => upd(idx, 'asset', v)} />
              <RowInput label="Hours" value={row.hours || ''} onChange={v => upd(idx, 'hours', v)} type="number" />
            </div>
          </div>
        );
      })}
      <AddMoreButton onClick={add} label="Add equipment" />
    </div>
  );
}

function MachineExtraCard({ q, answer, onAnswer }) {
  const rows = answer || [];
  const add = () => onAnswer(q.id, [...rows, { serial: '', machType: '', saDates: '', annualDates: '', diasafe: '', elecSafety: '', wos: '', tag: '', hours: '' }]);
  const upd = (idx, field, val) => onAnswer(q.id, rows.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  const remove = (idx) => onAnswer(q.id, rows.filter((_, i) => i !== idx));
  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div key={idx} className="bg-gray-50 rounded-xl p-4 relative">
          <RemoveButton onClick={() => remove(idx)} />
          <div className="text-xs font-medium text-gray-500 mb-3">Machine {21 + idx}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <RowInput label="Serial #" value={row.serial || ''} onChange={v => upd(idx, 'serial', v)} />
            <RowDropdown label="Machine Type" value={row.machType || ''} onChange={v => upd(idx, 'machType', v)} options={MACH_TYPE_OPTIONS} />
            <RowInput label="SA Dates" value={row.saDates || ''} onChange={v => upd(idx, 'saDates', v)} placeholder="MM/DD/YYYY" />
            <RowInput label="Annual Dates" value={row.annualDates || ''} onChange={v => upd(idx, 'annualDates', v)} placeholder="MM/DD/YYYY" />
            <RowSelect label="Diasafe" value={row.diasafe || ''} onChange={v => upd(idx, 'diasafe', v)} />
            <RowSelect label="Elec Safety" value={row.elecSafety || ''} onChange={v => upd(idx, 'elecSafety', v)} />
            <RowSelect label="WOs in Binder" value={row.wos || ''} onChange={v => upd(idx, 'wos', v)} />
            <RowInput label="Rendevor Tag #" value={row.tag || ''} onChange={v => upd(idx, 'tag', v)} />
            <RowInput label="Machine Hours" value={row.hours || ''} onChange={v => upd(idx, 'hours', v)} type="number" />
          </div>
        </div>
      ))}
      <AddMoreButton onClick={add} label="Add machine" />
    </div>
  );
}
