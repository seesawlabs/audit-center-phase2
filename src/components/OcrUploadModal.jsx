import { useState, useRef } from 'react';
import { ocrAuditImage, getYnQuestionMap } from '../lib/ocrAudit';

export default function OcrUploadModal({ existingAnswers, onConfirm, onClose }) {
  const [step, setStep] = useState('upload');
  const [extracted, setExtracted] = useState({});
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const questionMap = getYnQuestionMap();

  function addFiles(incoming) {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...Array.from(incoming).filter(f => !existing.has(f.name + f.size))];
    });
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleProcess() {
    if (!files.length) return;
    setStep('processing');
    setProgress({ done: 0, total: files.length });
    try {
      let merged = {};
      for (let i = 0; i < files.length; i++) {
        const result = await ocrAuditImage(files[i]);
        merged = { ...merged, ...result };
        setProgress({ done: i + 1, total: files.length });
      }
      setExtracted(merged);
      setStep('review');
    } catch (e) {
      setError(e.message);
      setStep('error');
    }
  }

  const ynEntries = Object.entries(extracted).filter(([k]) => !k.endsWith('_comment'));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-green-dark px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-white font-medium">Upload Paper Audit</div>
            {step === 'review' && (
              <div className="text-white/55 text-xs mt-0.5">{ynEntries.length} answer{ynEntries.length !== 1 ? 's' : ''} found across {files.length} document{files.length !== 1 ? 's' : ''}</div>
            )}
            {step === 'processing' && (
              <div className="text-white/55 text-xs mt-0.5">Processing {progress.done} of {progress.total}...</div>
            )}
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-5">
          {step === 'upload' && (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Upload photos or scans of a completed paper audit. Multiple pages or photos are supported — answers from all documents will be merged.
              </p>
              <div
                className={`border-2 border-dashed rounded-xl transition-colors ${isDragging ? 'border-green-mid bg-green-50' : 'border-gray-200'}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
              >
                {files.length === 0 ? (
                  <div className="text-center py-8 cursor-pointer" onClick={() => fileRef.current.click()}>
                    <svg className="mx-auto mb-3 text-gray-300" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
                    </svg>
                    <div className="text-sm text-gray-600">Click to upload or drag & drop</div>
                    <div className="text-xs text-gray-400 mt-1">JPG, PNG, PDF · Multiple files supported</div>
                  </div>
                ) : (
                  <div className="p-3 space-y-1.5">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" className="flex-shrink-0">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
                        </svg>
                        <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
                        <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                    <button className="text-xs text-green-mid hover:underline px-1 pt-0.5" onClick={() => fileRef.current.click()}>+ Add more files</button>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={e => addFiles(e.target.files)} />
              <p className="text-xs text-gray-400 mt-3 text-center">Requires VITE_ANTHROPIC_API_KEY in .env.local</p>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700 font-medium mb-3">
                <svg className="animate-spin text-green-mid" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Reading document {progress.done + 1} of {progress.total}...
              </div>
              <div className="w-48 mx-auto h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-mid rounded-full transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
              <div className="text-xs text-gray-400 mt-2">Answers from each page will be merged</div>
            </div>
          )}

          {step === 'review' && (
            <>
              {ynEntries.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-sm text-gray-500 mb-4">No answers could be extracted. Try clearer or better-lit images.</div>
                  <button onClick={() => setStep('upload')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Try again</button>
                </div>
              ) : (
                <>
                  <div className="text-xs text-gray-500 mb-2">Review extracted answers before importing. These will be merged with any existing answers.</div>
                  <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                    {ynEntries.map(([qid, ans]) => (
                      <div key={qid} className="flex items-start gap-2.5 px-3 py-2.5 text-xs">
                        <span className="font-mono text-gray-400 w-10 flex-shrink-0 pt-0.5">{qid}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-700">{questionMap[qid] || qid}</div>
                          {extracted[qid + '_comment'] && (
                            <div className="text-gray-400 italic mt-0.5">"{extracted[qid + '_comment']}"</div>
                          )}
                        </div>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full font-medium ${
                          ans === 'yes' ? 'bg-green-100 text-green-800' :
                          ans === 'no' ? 'bg-red-50 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {ans === 'na' ? 'N/A' : ans.charAt(0).toUpperCase() + ans.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {step === 'error' && (
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div className="text-sm font-medium text-gray-800 mb-1">Could not read the audit</div>
              <div className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">{error}</div>
              <button onClick={() => { setStep('upload'); setError(null); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Try again</button>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
          {step === 'upload' && (
            <>
              <span className="text-xs text-gray-400">{files.length > 0 ? `${files.length} file${files.length !== 1 ? 's' : ''} selected` : 'No files selected'}</span>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleProcess} disabled={!files.length} className={`px-4 py-1.5 rounded-lg text-sm font-medium text-white ${files.length ? 'bg-green-mid hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  Analyze {files.length > 0 ? `${files.length} file${files.length !== 1 ? 's' : ''}` : ''}
                </button>
              </div>
            </>
          )}
          {step === 'review' && ynEntries.length > 0 && (
            <>
              <button onClick={() => setStep('upload')} className="text-xs text-gray-400 hover:text-gray-600">Upload different files</button>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={() => onConfirm({ ...existingAnswers, ...extracted })} className="px-4 py-1.5 bg-green-mid text-white rounded-lg text-sm font-medium hover:bg-green-700">
                  Import {ynEntries.length} answer{ynEntries.length !== 1 ? 's' : ''}
                </button>
              </div>
            </>
          )}
          {(step === 'processing' || (step === 'review' && ynEntries.length === 0) || step === 'error') && (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
