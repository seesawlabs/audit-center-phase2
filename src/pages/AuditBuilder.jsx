import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAudit } from '../context/AuditContext';

const uid = () => Math.random().toString(36).slice(2, 9);
const makeSection = () => ({ id: 's_' + uid(), name: '', groups: [makeGroup()] });
const makeGroup = () => ({ id: 'g_' + uid(), name: '', questions: [] });
const makeQuestion = () => ({ id: 'q_' + uid(), text: '', type: 'yn', columns: [] });
const makeColumn = () => ({ id: 'c_' + uid(), label: '', type: 'text', options: '' });

const Q_TYPE_LABELS = { yn: 'Yes / No', text: 'Text', number: 'Number', 'item-table': 'Item Table' };
const COL_TYPE_LABELS = { text: 'Text', number: 'Number', yn: 'Yes / No', dropdown: 'Dropdown' };
const BUILDER_TYPES = new Set(['yn', 'text', 'number', 'item-table']);

function toBuilderSections(rawSections) {
  return rawSections
    .map(section => ({
      id: section.id || ('s_' + Math.random().toString(36).slice(2, 9)),
      name: section.name,
      groups: section.groups
        .map(group => ({
          id: group.id || ('g_' + Math.random().toString(36).slice(2, 9)),
          name: group.name,
          questions: group.questions
            .filter(q => BUILDER_TYPES.has(q.type) || q.type === 'calculated')
            .map(q => ({
              id: q.id || ('q_' + Math.random().toString(36).slice(2, 9)),
              text: q.text,
              type: q.type === 'calculated' ? 'number' : q.type,
              columns: (q.columns || []).map(c => ({
                id: c.id || ('c_' + Math.random().toString(36).slice(2, 9)),
                label: c.name || c.label || '',
                type: c.type || 'text',
                options: c.options || '',
              })),
            })),
        }))
        .filter(g => g.questions.length > 0),
    }))
    .filter(s => s.groups.length > 0);
}

export default function AuditBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createTemplate } = useAudit();

  const editState = location.state;
  const initialSections = editState?.editSections
    ? toBuilderSections(editState.editSections)
    : [makeSection()];

  const [name, setName] = useState(editState?.editName || '');
  const [description, setDescription] = useState(editState?.editDescription || '');
  const [sections, setSections] = useState(initialSections);

  const hasQuestions = sections.some(s => s.groups.some(g => g.questions.length > 0));
  const canSave = name.trim() && hasQuestions;

  // ── section helpers ──────────────────────────────────────────────────────────
  function addSection() {
    setSections(prev => [...prev, makeSection()]);
  }
  function removeSection(sId) {
    setSections(prev => prev.filter(s => s.id !== sId));
  }
  function updateSection(sId, field, val) {
    setSections(prev => prev.map(s => s.id === sId ? { ...s, [field]: val } : s));
  }

  // ── group helpers ────────────────────────────────────────────────────────────
  function addGroup(sId) {
    setSections(prev => prev.map(s => s.id === sId ? { ...s, groups: [...s.groups, makeGroup()] } : s));
  }
  function removeGroup(sId, gId) {
    setSections(prev => prev.map(s => s.id === sId ? { ...s, groups: s.groups.filter(g => g.id !== gId) } : s));
  }
  function updateGroup(sId, gId, field, val) {
    setSections(prev => prev.map(s => s.id === sId
      ? { ...s, groups: s.groups.map(g => g.id === gId ? { ...g, [field]: val } : g) }
      : s));
  }

  // ── question helpers ─────────────────────────────────────────────────────────
  function addQuestion(sId, gId) {
    setSections(prev => prev.map(s => s.id === sId
      ? { ...s, groups: s.groups.map(g => g.id === gId ? { ...g, questions: [...g.questions, makeQuestion()] } : g) }
      : s));
  }
  function removeQuestion(sId, gId, qId) {
    setSections(prev => prev.map(s => s.id === sId
      ? { ...s, groups: s.groups.map(g => g.id === gId ? { ...g, questions: g.questions.filter(q => q.id !== qId) } : g) }
      : s));
  }
  function updateQuestion(sId, gId, qId, field, val) {
    setSections(prev => prev.map(s => s.id === sId
      ? { ...s, groups: s.groups.map(g => g.id === gId
          ? { ...g, questions: g.questions.map(q => q.id === qId ? { ...q, [field]: val } : q) }
          : g) }
      : s));
  }

  // ── column helpers ───────────────────────────────────────────────────────────
  function addColumn(sId, gId, qId) {
    setSections(prev => prev.map(s => s.id === sId
      ? { ...s, groups: s.groups.map(g => g.id === gId
          ? { ...g, questions: g.questions.map(q => q.id === qId ? { ...q, columns: [...(q.columns || []), makeColumn()] } : q) }
          : g) }
      : s));
  }
  function removeColumn(sId, gId, qId, cId) {
    setSections(prev => prev.map(s => s.id === sId
      ? { ...s, groups: s.groups.map(g => g.id === gId
          ? { ...g, questions: g.questions.map(q => q.id === qId ? { ...q, columns: q.columns.filter(c => c.id !== cId) } : q) }
          : g) }
      : s));
  }
  function updateColumn(sId, gId, qId, cId, field, val) {
    setSections(prev => prev.map(s => s.id === sId
      ? { ...s, groups: s.groups.map(g => g.id === gId
          ? { ...g, questions: g.questions.map(q => q.id === qId
              ? { ...q, columns: q.columns.map(c => c.id === cId ? { ...c, [field]: val } : c) }
              : q) }
          : g) }
      : s));
  }

  function handleSave() {
    createTemplate({ name: name.trim(), description: description.trim(), sections });
    navigate('/');
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="px-5 pt-3 border-b border-gray-100 flex-shrink-0">
          <div className="text-xs text-gray-400 flex items-center gap-1 mb-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            Audit Center › Audit Builder
          </div>
          <div className="flex items-center justify-between pb-3">
            <div className="text-lg font-medium text-gray-900">{editState?.editSections ? 'Edit Audit' : 'Build New Audit'}</div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/')} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${canSave ? 'bg-green-mid hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                Save Template
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-3xl mx-auto space-y-4">

            {/* Audit metadata */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Audit name <span className="text-red-400">*</span></label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Facility Safety Inspection"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Description</label>
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional short description of this audit"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
                />
              </div>
            </div>

            {/* Sections */}
            {sections.map((section, sIdx) => (
              <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">

                {/* Section header */}
                <div className="bg-green-dark/90 px-4 py-3 flex items-center gap-3">
                  <span className="text-white/60 text-xs font-medium uppercase tracking-wide w-20 flex-shrink-0">Section {sIdx + 1}</span>
                  <input
                    value={section.name}
                    onChange={e => updateSection(section.id, 'name', e.target.value)}
                    placeholder="Section name..."
                    className="flex-1 bg-white/15 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                  />
                  {sections.length > 1 && (
                    <button onClick={() => removeSection(section.id)} className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>

                {/* Groups */}
                <div className="p-4 space-y-3">
                  {section.groups.map((group, gIdx) => (
                    <div key={group.id} className="border border-gray-100 rounded-xl overflow-hidden">

                      {/* Group header */}
                      <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-3 border-b border-gray-100">
                        <span className="text-gray-400 text-xs font-medium uppercase tracking-wide w-16 flex-shrink-0">Group {gIdx + 1}</span>
                        <input
                          value={group.name}
                          onChange={e => updateGroup(section.id, group.id, 'name', e.target.value)}
                          placeholder="Group name..."
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-green-mid"
                        />
                        {section.groups.length > 1 && (
                          <button onClick={() => removeGroup(section.id, group.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        )}
                      </div>

                      {/* Questions */}
                      <div className="px-4 py-3 space-y-2">
                        {group.questions.map((q, qIdx) => (
                          <div key={q.id}>
                            {/* Question row */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-300 w-5 text-right flex-shrink-0">{qIdx + 1}.</span>
                              <input
                                value={q.text}
                                onChange={e => updateQuestion(section.id, group.id, q.id, 'text', e.target.value)}
                                placeholder="Question text..."
                                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-mid"
                              />
                              <select
                                value={q.type}
                                onChange={e => updateQuestion(section.id, group.id, q.id, 'type', e.target.value)}
                                className="w-36 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:border-green-mid flex-shrink-0"
                              >
                                {Object.entries(Q_TYPE_LABELS).map(([val, label]) => (
                                  <option key={val} value={val}>{label}</option>
                                ))}
                              </select>
                              <button onClick={() => removeQuestion(section.id, group.id, q.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
                            </div>

                            {/* Column editor for item-table */}
                            {q.type === 'item-table' && (
                              <div className="ml-7 mt-2 pl-3 border-l-2 border-green-mid/20 space-y-1.5">
                                <div className="text-xs text-gray-400 mb-1.5">Table columns</div>
                                {(q.columns || []).map((col, cIdx) => (
                                  <div key={col.id} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-300 w-4 text-right flex-shrink-0">{cIdx + 1}.</span>
                                    <input
                                      value={col.label}
                                      onChange={e => updateColumn(section.id, group.id, q.id, col.id, 'label', e.target.value)}
                                      placeholder="Column label..."
                                      className="flex-1 px-2.5 py-1 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-green-mid"
                                    />
                                    <select
                                      value={col.type}
                                      onChange={e => updateColumn(section.id, group.id, q.id, col.id, 'type', e.target.value)}
                                      className="w-28 px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:border-green-mid flex-shrink-0"
                                    >
                                      {Object.entries(COL_TYPE_LABELS).map(([val, label]) => (
                                        <option key={val} value={val}>{label}</option>
                                      ))}
                                    </select>
                                    {col.type === 'dropdown' && (
                                      <input
                                        value={col.options}
                                        onChange={e => updateColumn(section.id, group.id, q.id, col.id, 'options', e.target.value)}
                                        placeholder="Option A, Option B..."
                                        className="flex-1 px-2.5 py-1 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-green-mid"
                                      />
                                    )}
                                    <button onClick={() => removeColumn(section.id, group.id, q.id, col.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => addColumn(section.id, group.id, q.id)}
                                  className="flex items-center gap-1 text-xs text-green-mid hover:text-green-700 transition-colors mt-1"
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                  Add column
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add question */}
                        <button
                          onClick={() => addQuestion(section.id, group.id)}
                          className="w-full mt-1 py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-green-mid hover:text-green-mid transition-colors flex items-center justify-center gap-1.5"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Add question
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add group */}
                  <button
                    onClick={() => addGroup(section.id)}
                    className="w-full py-2 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-green-mid hover:text-green-mid transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add group
                  </button>
                </div>
              </div>
            ))}

            {/* Add section */}
            <button
              onClick={addSection}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-green-mid hover:text-green-mid transition-colors flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add section
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
