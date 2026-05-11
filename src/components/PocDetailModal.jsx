import { useState } from 'react';
import PhotoUpload from './PhotoUpload';
import { TEAM_MEMBERS } from '../data/biomedAudit';

const STATUS_STYLES = {
  complete: 'text-green-800 bg-green-100',
  Complete: 'text-green-800 bg-green-100',
  incomplete: 'text-amber-800 bg-amber-50',
  Incomplete: 'text-amber-800 bg-amber-50',
  'in-progress': 'text-blue-800 bg-blue-50',
  'In Progress': 'text-blue-800 bg-blue-50',
};

export default function PocDetailModal({ poc, onSave, onClose }) {
  const [data, setData] = useState({ ...poc });

  function update(field, value) {
    setData(prev => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave(data);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="bg-green-dark px-5 py-4 flex items-start justify-between flex-shrink-0 rounded-t-2xl">
          <div>
            <div className="text-white font-medium text-base">Plan of Correction</div>
            <div className="text-white/55 text-xs mt-0.5">{data.section || 'Plan Details'}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white mt-0.5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* Unmet item */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Unmet audit item</div>
            <div className="text-xs text-gray-500 mb-1">{data.section}</div>
            <div className="text-sm font-medium text-gray-900 leading-snug">{data.text}</div>
            {data.comment && (
              <div className="mt-2.5 pt-2.5 border-t border-gray-200 flex gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <span className="text-xs text-gray-500 italic">{data.comment}</span>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Photos</div>
              <PhotoUpload
                photos={data.photos || []}
                onChange={newPhotos => update('photos', newPhotos)}
              />
            </div>
          </div>

          {/* Plan of correction */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1.5">Plan of correction</label>
            <textarea
              rows={4}
              value={data.plan}
              onChange={e => update('plan', e.target.value)}
              placeholder="Describe the corrective action to be taken..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 resize-none focus:outline-none focus:border-green-mid"
            />
          </div>

          {/* 3-col row */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Assign to</label>
              <select
                value={data.assignee}
                onChange={e => update('assignee', e.target.value)}
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
                value={data.dueDate}
                onChange={e => update('dueDate', e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Status</label>
              <div className={`px-2.5 py-2 rounded-lg text-sm font-medium ${STATUS_STYLES[data.status] || 'text-gray-700 bg-gray-100'}`}>
                {data.status}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="poc-detail-emergency"
              checked={data.emergency}
              onChange={e => update('emergency', e.target.checked)}
              className="w-3.5 h-3.5 cursor-pointer"
            />
            <label htmlFor="poc-detail-emergency" className="text-sm text-gray-500 cursor-pointer">
              Mark as emergency
            </label>
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
            className="px-4 py-1.5 bg-green-mid text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
