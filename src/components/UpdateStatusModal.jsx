import { useState } from 'react';
import PhotoUpload from './PhotoUpload';

const STATUS_OPTIONS = [
  'In Progress',
  'Resolved',
  'Client Issue - Communicated',
  'Client Issue - Resolved',
];

const STATUS_STYLES = {
  'In Progress': 'text-blue-800 bg-blue-50',
  'Resolved': 'text-green-800 bg-green-100',
  'Client Issue - Communicated': 'text-amber-800 bg-amber-50',
  'Client Issue - Resolved': 'text-green-800 bg-green-100',
};

export default function UpdateStatusModal({ poc, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [changedAt, setChangedAt] = useState(today);
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState([]);

  function handleSave() {
    const updatedPoc = {
      ...poc,
      status,
      statusChangedAt: changedAt,
      statusNote: note,
      photos: [...(poc.photos || []), ...photos],
    };
    const event = {
      id: 'e' + Date.now(),
      timestamp: new Date().toISOString(),
      changedAt,
      user: null, // resolved by AuditRow using audit.auditor
      type: 'Status Update',
      pocId: poc.id,
      pocText: poc.text,
      previousStatus: poc.status,
      newStatus: status,
      note,
    };
    onSave(updatedPoc, event);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="bg-green-dark px-5 py-4 flex items-start justify-between flex-shrink-0 rounded-t-2xl">
          <div>
            <div className="text-white font-medium text-base">Update Status</div>
            <div className="text-white/55 text-xs mt-0.5 truncate max-w-xs">{poc.text}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white mt-0.5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Current status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500">
            Current status:
            <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[poc.status] || 'text-gray-700 bg-gray-100'}`}>
              {poc.status}
            </span>
          </div>

          {/* New status */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">New status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {status && (
              <div className="mt-1.5">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || 'text-gray-700 bg-gray-100'}`}>
                  {status}
                </span>
              </div>
            )}
          </div>

          {/* Status changed at */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Status changed at</label>
            <input
              type="date"
              value={changedAt}
              onChange={e => setChangedAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Note</label>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note about this status change..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 resize-none focus:outline-none focus:border-green-mid"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Photos</label>
            <PhotoUpload photos={photos} onChange={setPhotos} />
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-end gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!status}
            className="px-4 py-1.5 bg-green-mid text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Update Status
          </button>
        </div>

      </div>
    </div>
  );
}
