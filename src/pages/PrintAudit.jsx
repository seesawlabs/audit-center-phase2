import { useParams, useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { BIOMED_SECTIONS } from '../data/biomedAudit';

const YNA = () => (
  <span className="inline-flex gap-3 text-xs flex-shrink-0 ml-3">
    <span className="flex items-center gap-1"><span className="inline-block w-3.5 h-3.5 border border-gray-700 rounded-sm" /> Yes</span>
    <span className="flex items-center gap-1"><span className="inline-block w-3.5 h-3.5 border border-gray-700 rounded-sm" /> No</span>
    <span className="flex items-center gap-1"><span className="inline-block w-3.5 h-3.5 border border-gray-700 rounded-sm" /> N/A</span>
  </span>
);

function MachineTable({ questions }) {
  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full text-xs border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-100">
            {['Machine', 'Serial #', 'Machine Type', 'SA Dates', 'Annual Dates',
              'Diasafe', 'Elec Safety', 'WOs in Binder', 'Tag #', 'Hours'].map(h => (
              <th key={h} className="border border-gray-400 px-1.5 py-1 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {questions.filter(q => q.type === 'machine-row').map(q => (
            <tr key={q.id} style={{ height: '28px' }}>
              <td className="border border-gray-400 px-1.5 py-1 font-medium">{q.text}</td>
              <td className="border border-gray-400 px-1.5 py-1" />
              <td className="border border-gray-400 px-1.5 py-1" />
              <td className="border border-gray-400 px-1.5 py-1" />
              <td className="border border-gray-400 px-1.5 py-1" />
              {['Diasafe', 'Elec', 'WOs'].map(col => (
                <td key={col} className="border border-gray-400 px-1 py-1">
                  <span className="flex gap-2 text-xs">
                    <span className="flex items-center gap-0.5"><span className="inline-block w-3 h-3 border border-gray-600 rounded-sm" /> Y</span>
                    <span className="flex items-center gap-0.5"><span className="inline-block w-3 h-3 border border-gray-600 rounded-sm" /> N</span>
                  </span>
                </td>
              ))}
              <td className="border border-gray-400 px-1.5 py-1" />
              <td className="border border-gray-400 px-1.5 py-1" />
            </tr>
          ))}
          {/* Spare rows for extra machines */}
          {[...Array(3)].map((_, i) => (
            <tr key={`extra-${i}`} style={{ height: '28px' }}>
              {[...Array(10)].map((_, j) => (
                <td key={j} className="border border-gray-300 px-1.5 py-1" />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EquipTable({ questions, label }) {
  const rows = questions.filter(q => q.type === 'equipment-row');
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <table className="w-full text-xs border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-100">
            {['Item', 'Manufacturer', 'Model #', 'Serial #', 'Asset #', 'Hours'].map(h => (
              <th key={h} className="border border-gray-400 px-1.5 py-1 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(q => (
            <tr key={q.id} style={{ height: '26px' }}>
              <td className="border border-gray-400 px-1.5 py-1 font-medium">{q.text}</td>
              <td className="border border-gray-400 px-1.5 py-1" />
              <td className="border border-gray-400 px-1.5 py-1" />
              <td className="border border-gray-400 px-1.5 py-1" />
              <td className="border border-gray-400 px-1.5 py-1" />
              <td className="border border-gray-400 px-1.5 py-1" />
            </tr>
          ))}
          {[...Array(2)].map((_, i) => (
            <tr key={`extra-${i}`} style={{ height: '26px' }}>
              {[...Array(6)].map((_, j) => (
                <td key={j} className="border border-gray-300 px-1.5 py-1" />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuestionRow({ q }) {
  if (q.type === 'calculated' || q.type === 'machine-row' || q.type === 'equipment-row' || q.type === 'machine-extra' || q.type === 'equipment-extra') return null;

  return (
    <div className="mb-2.5">
      {q.type === 'yn' && (
        <>
          <div className="flex items-start">
            <span className="text-gray-400 text-xs font-mono mr-2 mt-0.5 w-14 flex-shrink-0">{q.id}</span>
            <span className="text-xs flex-1 leading-snug">{q.text}</span>
            <YNA />
          </div>
          <div className="ml-16 mt-1 text-xs text-gray-400 flex items-center gap-1">
            <span>Comment:</span>
            <span className="flex-1 border-b border-dashed border-gray-300" style={{ minWidth: '200px' }} />
          </div>
        </>
      )}
      {(q.type === 'text' || q.type === 'number') && (
        <div className="flex items-start gap-2">
          <span className="text-gray-400 text-xs font-mono mt-0.5 w-14 flex-shrink-0">{q.id}</span>
          <div className="flex-1">
            <div className="text-xs leading-snug mb-1">{q.text}</div>
            <div className="border-b border-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}

function GroupBlock({ group }) {
  const hasMachines = group.questions.some(q => q.type === 'machine-row');
  const hasEquipment = group.questions.some(q => q.type === 'equipment-row');
  const regularQs = group.questions.filter(q =>
    q.type !== 'machine-row' && q.type !== 'equipment-row' && q.type !== 'machine-extra' && q.type !== 'equipment-extra' && q.type !== 'calculated'
  );

  return (
    <div className="mb-4">
      <div className="text-xs font-bold uppercase tracking-wide text-gray-600 bg-gray-100 px-2 py-1 mb-2 rounded">
        {group.name}
      </div>
      {regularQs.map(q => <QuestionRow key={q.id} q={q} />)}
      {hasMachines && <MachineTable questions={group.questions} />}
      {hasEquipment && <EquipTable questions={group.questions} label="" />}
    </div>
  );
}

export default function PrintAudit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { audits } = useAudit();
  const audit = id === 'blank' ? null : audits.find(a => a.id === id);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .page-break { page-break-before: always; }
        }
        @media screen {
          .print-page { max-width: 850px; margin: 0 auto; padding: 32px; background: white; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 z-10 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-green-mid text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print Audit
        </button>
        <span className="text-sm text-gray-500">{audit.name}</span>
      </div>

      <div className="print-page pt-16 print:pt-0">
        {/* Audit header */}
        <div className="mb-6 pb-4 border-b-2 border-gray-800">
          <div className="text-xl font-bold text-gray-900 mb-2">
            {audit ? audit.name : 'BioMed Audit — Rendevor Dialysis'}
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-600 flex-shrink-0">Facility:</span>
              {audit ? <span className="text-gray-800 ml-1">{audit.facility}</span> : <span className="flex-1 border-b border-gray-400 ml-1" />}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-600 flex-shrink-0">Auditor:</span>
              {audit ? <span className="text-gray-800 ml-1">{audit.auditor}</span> : <span className="flex-1 border-b border-gray-400 ml-1" />}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-600 flex-shrink-0">Date:</span>
              <span className="flex-1 border-b border-gray-400 ml-1" />
            </div>
          </div>
        </div>

        {/* Sections */}
        {BIOMED_SECTIONS.map((section, si) => (
          <div key={section.id} className={si > 0 ? 'page-break' : ''}>
            <div className="text-base font-bold text-white bg-gray-800 px-3 py-1.5 mb-3 rounded">
              {section.name}
            </div>
            {section.groups.map(group => (
              <GroupBlock key={group.id} group={group} />
            ))}
          </div>
        ))}

        {/* Signature block */}
        <div className="mt-8 pt-6 border-t border-gray-300 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="font-semibold text-gray-600 mb-3">Auditor Signature</div>
            <div className="border-b border-gray-400 mb-1" />
            <div className="text-gray-400">Signature / Date</div>
          </div>
          <div>
            <div className="font-semibold text-gray-600 mb-3">Facility Representative</div>
            <div className="border-b border-gray-400 mb-1" />
            <div className="text-gray-400">Signature / Date</div>
          </div>
        </div>
      </div>
    </>
  );
}
