import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { parse as mathParse } from 'mathjs';
import Sidebar from '../components/Sidebar';
import { useAudit } from '../context/AuditContext';

const uid = () => Math.random().toString(36).slice(2, 9);
const makeSection = () => ({ id: 's_' + uid(), name: '', groups: [makeGroup()] });
const makeGroup = () => ({ id: 'g_' + uid(), name: '', questions: [] });
const makeQuestion = () => ({ id: 'q_' + uid(), text: '', type: 'yn', columns: [], varName: '', formula: '', unit: '' });
const makeColumn = () => ({ id: 'c_' + uid(), label: '', type: 'text', options: '' });

const Q_TYPE_LABELS = { yn: 'Yes / No', text: 'Text', number: 'Number', 'item-table': 'Item Table', calculated: 'Calculated' };
const COL_TYPE_LABELS = { text: 'Text', number: 'Number', yn: 'Yes / No', dropdown: 'Dropdown' };
const BUILDER_TYPES = new Set(['yn', 'text', 'number', 'item-table', 'calculated']);

function toVarName(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '_').replace(/_+$/, '').slice(0, 40);
}

function validateFormula(formula) {
  if (!formula || !formula.trim()) return null;
  try { mathParse(formula); return { valid: true }; }
  catch (e) { return { valid: false, error: e.message.split('\n')[0] }; }
}

function toBuilderSections(rawSections) {
  const sid = () => Math.random().toString(36).slice(2, 9);

  return rawSections
    .map(section => ({
      id: section.id || ('s_' + sid()),
      name: section.name,
      groups: section.groups
        .map(group => {
          const machineRows = group.questions.filter(q => q.type === 'machine-row');
          const equipRows   = group.questions.filter(q => q.type === 'equipment-row');
          const regularQs   = group.questions
            .filter(q => BUILDER_TYPES.has(q.type))
            .map(q => ({
              id: q.id || ('q_' + sid()),
              text: q.text,
              type: q.type,
              varName: q.varName || '',
              formula: typeof q.formula === 'string' ? q.formula : '',
              unit: q.unit || '',
              columns: (q.columns || []).map(c => ({
                id: c.id || ('c_' + sid()),
                label: c.name || c.label || '',
                type: c.type || 'text',
                options: c.options || '',
              })),
            }));

          if (machineRows.length > 0) {
            regularQs.push({
              id: 'tbl_mach_' + group.id,
              text: machineRows.map(q => q.text).join(', '),
              type: 'item-table',
              varName: '', formula: '', unit: '',
              columns: [
                { id: 'mc1', label: 'Machine',       type: 'text',   options: '' },
                { id: 'mc2', label: 'Serial #',      type: 'text',   options: '' },
                { id: 'mc3', label: 'Machine Type',  type: 'text',   options: '' },
                { id: 'mc4', label: 'SA Dates',      type: 'text',   options: '' },
                { id: 'mc5', label: 'Annual Dates',  type: 'text',   options: '' },
                { id: 'mc6', label: 'Diasafe',       type: 'yn',     options: '' },
                { id: 'mc7', label: 'Elec Safety',   type: 'yn',     options: '' },
                { id: 'mc8', label: 'WOs in Binder', type: 'yn',     options: '' },
                { id: 'mc9', label: 'Tag #',         type: 'text',   options: '' },
                { id: 'mc10',label: 'Hours',         type: 'number', options: '' },
              ],
            });
          }

          if (equipRows.length > 0) {
            regularQs.push({
              id: 'tbl_equip_' + group.id,
              text: equipRows.map(q => q.text).join(', '),
              type: 'item-table',
              varName: '', formula: '', unit: '',
              columns: [
                { id: 'ec1', label: 'Description',  type: 'text',   options: '' },
                { id: 'ec2', label: 'Manufacturer', type: 'text',   options: '' },
                { id: 'ec3', label: 'Model #',      type: 'text',   options: '' },
                { id: 'ec4', label: 'Serial #',     type: 'text',   options: '' },
                { id: 'ec5', label: 'Asset #',      type: 'text',   options: '' },
                { id: 'ec6', label: 'Hours',        type: 'number', options: '' },
              ],
            });
          }

          return {
            id: group.id || ('g_' + sid()),
            name: group.name,
            questions: regularQs,
          };
        })
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

  // All numeric questions with a varName — used as formula variable chips
  const allVarNames = sections.flatMap(s =>
    s.groups.flatMap(g =>
      g.questions
        .filter(q => q.varName && q.type === 'number')
        .map(q => ({ varName: q.varName, text: q.text }))
    )
  );

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
          ? { ...g, questions: g.questions.map(q => {
              if (q.id !== qId) return q;
              const updates = { [field]: val };
              // Auto-generate varName from question text when the field is empty
              if (field === 'text' && !q.varName && q.type === 'number') {
                updates.varName = toVarName(val);
              }
              // Clear varName when type changes away from number
              if (field === 'type' && val !== 'number') {
                updates.varName = '';
              }
              // Auto-set varName when type changes TO number and text exists
              if (field === 'type' && val === 'number' && q.text && !q.varName) {
                updates.varName = toVarName(q.text);
              }
              return { ...q, ...updates };
            }) }
          : g) }
      : s));
  }

  function appendToFormula(sId, gId, qId, currentFormula, varName) {
    const separator = currentFormula && !currentFormula.endsWith(' ') ? ' ' : '';
    updateQuestion(sId, gId, qId, 'formula', currentFormula + separator + varName);
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
                  {section.groups.map((group, gIdx) => {
                    const groupHasCalculated = group.questions.some(q => q.type === 'calculated');
                    return (
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
                        {group.questions.map((q, qIdx) => {
                          const formulaStatus = q.type === 'calculated' ? validateFormula(q.formula) : null;
                          return (
                            <div key={q.id} className="space-y-1.5">
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

                              {/* Variable name shown only when this group contains a calculated question */}
                              {q.type === 'number' && groupHasCalculated && (
                                <div className="ml-7 flex items-center gap-1.5">
                                  <span className="text-xs text-gray-400 flex-shrink-0">var:</span>
                                  <input
                                    value={q.varName || ''}
                                    onChange={e => updateQuestion(section.id, group.id, q.id, 'varName', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    placeholder="variable_name"
                                    className="w-52 px-2 py-0.5 border border-gray-200 rounded font-mono text-xs text-gray-600 focus:outline-none focus:border-green-mid"
                                  />
                                  <span className="text-xs text-gray-300">use in calculated formulas</span>
                                </div>
                              )}

                              {/* Formula editor for calculated questions */}
                              {q.type === 'calculated' && (
                                <div className="ml-7 pl-3 border-l-2 border-purple-200 space-y-2">
                                  <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                      <label className="text-xs text-gray-400 mb-1 block">Formula</label>
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          value={q.formula || ''}
                                          onChange={e => updateQuestion(section.id, group.id, q.id, 'formula', e.target.value)}
                                          placeholder="e.g. (primary_carbon + secondary_carbon) / ro_flow * 7.48"
                                          className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono text-gray-800 focus:outline-none focus:border-green-mid"
                                        />
                                        {formulaStatus && (
                                          formulaStatus.valid
                                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" className="flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                                            : <span title={formulaStatus.error} className="flex-shrink-0 cursor-help">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                              </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="w-24 flex-shrink-0">
                                      <label className="text-xs text-gray-400 mb-1 block">Unit</label>
                                      <input
                                        value={q.unit || ''}
                                        onChange={e => updateQuestion(section.id, group.id, q.id, 'unit', e.target.value)}
                                        placeholder="min, %…"
                                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-green-mid"
                                      />
                                    </div>
                                  </div>
                                  {formulaStatus && !formulaStatus.valid && (
                                    <div className="text-xs text-red-500">{formulaStatus.error}</div>
                                  )}
                                  {allVarNames.length > 0 && (
                                    <div>
                                      <div className="text-xs text-gray-400 mb-1">Insert variable:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {allVarNames.map(v => (
                                          <button
                                            key={v.varName}
                                            onClick={() => appendToFormula(section.id, group.id, q.id, q.formula || '', v.varName)}
                                            title={v.text}
                                            className="px-2 py-0.5 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 hover:border-purple-300 rounded font-mono text-xs text-gray-600 transition-colors"
                                          >
                                            {v.varName}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-400">
                                    Supports: <span className="font-mono">+ - * / ^ ( )</span> and functions like <span className="font-mono">round(x, 2)</span>, <span className="font-mono">min(a, b)</span>, <span className="font-mono">max(a, b)</span>, <span className="font-mono">sqrt(x)</span>, <span className="font-mono">abs(x)</span>
                                  </div>
                                </div>
                              )}

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
                          );
                        })}

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
                  );
                  })}

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
