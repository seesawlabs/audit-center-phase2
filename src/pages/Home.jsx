import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAudit } from '../context/AuditContext';
import UploadAuditModal from '../components/UploadAuditModal';
import PocDetailModal from '../components/PocDetailModal';
import UpdateStatusModal from '../components/UpdateStatusModal';
import { BIOMED_SECTIONS } from '../data/biomedAudit';

async function downloadBiomedTemplate() {
  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();

  const yn = { type: 'list', allowBlank: true, formulae: ['"Yes,No,N/A"'], showDropDown: false, showErrorMessage: true, errorStyle: 'error', errorTitle: 'Invalid Entry', error: 'Please select Yes, No, or N/A.' };
  const sel = (opts) => ({ type: 'list', allowBlank: true, formulae: [`"${opts}"`], showDropDown: false, showErrorMessage: true, errorStyle: 'error', errorTitle: 'Invalid Entry', error: 'Please select from the list.' });
  const dv = (ws, range, v = yn) => ws.dataValidations.add(range, v);
  const bold = (ws, ...rows) => rows.forEach(r => ws.getRow(r).eachCell(cell => { cell.font = { bold: true }; }));

  // ── Sheet 1: Supplies & Equipment ──────────────────────────────────────────
  const s1 = wb.addWorksheet('Supplies & Equipment');
  s1.columns = [{ width: 55 }, { width: 15 }, { width: 35 }];
  s1.addRows([
    ['Rendevor Dialysis'],
    ['Annual Technical Audit'],
    ['Date:', ''],
    ['Audit complete by:', '', 'Location:'],
    [],
    ['Supplies / Equipment', 'Yes/No', 'Comments'],
    ['Emergency Evacuation Box', '', ''],
    ['Fire Extinguishers', '', 'Location:'],
    ['Exit Signs', '', ''],
    ['Evacuation Diagram Posted', '', 'Location:'],
    ['All Conc. / Bicarb Jugs Labeled', '', ''],
    ['Eyewash Station', '', 'Location:'],
    ['Blood Spill Kit', '', ''],
    ['Minncare / Peracidin Spill Kit', '', ''],
    ['Myron L Meters (Quantity)', 'Meters on Floor:', 'ISO Meter:'],
    ['1% Bleach Cleaning Solution', '', 'Measuring Device:'],
    [],
    ['Water Treatment', 'Yes/No', 'Comments'],
    ['Carbon x 7.48 = /flow = EBCT', 'EBCT -- Date & calculation:', ''],
    ['EBCT Calculated (Only for Tanks)', 'Primary Carbon (CuFt)', 'Secondary Carbon (CuFt)'],
    [],
    ['Flow Diagram and Valve Legend Posted', '', 'Location:'],
    ['Deionization Tank Accessible', '', ''],
    ['Prefilter Changed and Date Posted', '', ''],
    ['External Water Quality Alarm Installed', '', 'Location:'],
    ['Pyrogen Filter Changed and Date Posted', '', 'Date Changed:'],
    ['Diasafe Filters Used', '', 'Date Changed:'],
    ['RO 1: Feed - Product / Feed X 100 = % Rej', 'Feed TDS', '% Rejection:'],
    ['Type:', '', ''],
    ['Water In-Service', 'Number of Staff Attended:', ''],
    [],
    ['Notes:'],
    ['EBCT: Enter Volume of Carbon in each tank & RO Product Flow in appropriate cell. EBCT automatically calculates.'],
    ['Percent Rejection: Enter Feed & Product TDS in appropriate cell. Percent Rejection automatically calculates.'],
  ]);
  bold(s1, 1, 2, 6, 18);
  dv(s1, 'B7:B14');
  dv(s1, 'B16:B16');
  dv(s1, 'B22:B27');

  // ── Sheet 2: Water Treatment ───────────────────────────────────────────────
  const s2 = wb.addWorksheet('Water Treatment');
  s2.columns = [{ width: 50 }, { width: 20 }, { width: 20 }, { width: 15 }, { width: 15 }, { width: 12 }];
  s2.addRows([
    ['Water Treatment'],
    [],
    ['RO Systems'],
    ['Amount of Machine Stations', '# of Stations:', '# of Machines:'],
    [],
    ['RO #', 'Manufacturer', 'Model #', 'Serial #', 'Asset #', 'Hours'],
    ['RO 1', '', '', '', '', ''],
    ['RO 2', '', '', '', '', ''],
    ['RO 3', '', '', '', '', ''],
    [],
    ['Water System Checklist', 'Yes/No', 'Comments'],
    ['Timer Heads / Correct Time', '', ''],
    ['Carbon Exchanged', '', 'Last Change Date:'],
    ['Disinfection Procedure Present', '', ''],
    ['DI Bypass Being Disinfected', '', ''],
    ['EBCT Posted on Carbon Tanks', '', ''],
    ['Pretreatment Equipment Labeled', '', ''],
    ['Biomed Contact Info Available', '', 'Name: / Number:'],
    ['Emergency Water Vendor Info Available', '', 'Name: / Number:'],
    ['Last Analysis Completed', '', 'RO Water Date: / Tap Water Date:'],
    [],
    ['Operational Logs', 'Yes/No', 'Comments'],
    ['R.O. / Water Logs', '', ''],
    ['Bicarb Tank Disinfection Log', '', ''],
    ['Bicarb Jug Disinfection Log', '', ''],
    ['Bicarb Mixing Log', '', ''],
    ['Concentrate Mixing Log', '', ''],
    ['Conductivity Meter Log', '', ''],
    ['R.O. Disinfection Log', '', ''],
    ['Electrical Safety Check (Annual)', '', ''],
    ['Machine Disinfection Log', '', ''],
    ['Compare Random Entries to Logs', '', 'Type: / Match: / Spare:'],
    [],
    ['Comments:'],
  ]);
  bold(s2, 1, 3, 6, 11, 22);
  dv(s2, 'B7:B9', sel('MarCor/Evoqua'));
  dv(s2, 'C7:C9', sel('4400,700 Series,Millennium'));
  dv(s2, 'B12:B12');
  dv(s2, 'B14:B17');
  dv(s2, 'B23:B31');

  // ── Sheet 3: Physical Plant & HMIS ────────────────────────────────────────
  const s3 = wb.addWorksheet('Physical Plant & HMIS');
  s3.columns = [{ width: 60 }, { width: 15 }, { width: 30 }];
  s3.addRows([
    ['Physical Plant', 'Yes/No', 'Comments'],
    ['Adequate Storage Space', '', ''],
    ['Ceiling Intact', '', ''],
    ['Flooring Intact', '', ''],
    ['Walls Intact', '', ''],
    ['Emergency Lighting / Generator', '', ''],
    ['Furniture Intact', '', ''],
    ['Clean Work Area', '', ''],
    ['Chairs Free from Damage (Tears, Cracks, Corrosion, Operational)', '', ''],
    ['Clean / Dirty Sinks Signage Posted', '', ''],
    ['GFI Outlets', '', ''],
    [],
    ['SDS', 'Yes/No', 'Comments'],
    ['Bicarb Powder / Liquid', '', ''],
    ['Concentrate SDS', '', ''],
    ['Bleach SDS', '', ''],
    ['Vinegar SDS', '', ''],
    ['Minncare / Peracidin / Micro X SDS', '', ''],
    ['Calibration Solutions SDS (Specific to Facility Meters)', '', ''],
    ['Eyewash Solution SDS', '', ''],
    ['Drain Gel SDS', '', ''],
    ['PT 401 SDS', '', ''],
    ['Americlean A SDS', '', ''],
    ['Americlean B SDS', '', ''],
    ['Access to HCP Website', '', ''],
    ['HMIS Program in Place', '', ''],
    [],
    ['Technical Books', 'Yes/No', 'Comments'],
    ['Machine Binder', '', ''],
    ['Central Water System Binder', '', ''],
    ['Portable RO Binder', '', ''],
    ['Water Quality Binder', '', ''],
    [],
    ['Comments:'],
  ]);
  bold(s3, 1, 13, 28);
  dv(s3, 'B2:B11');
  dv(s3, 'B14:B26');
  dv(s3, 'B29:B32');

  // ── Sheet 4: HD Machines ───────────────────────────────────────────────────
  const s4 = wb.addWorksheet('HD Machines');
  s4.columns = [{ width: 55 }, { width: 20 }, { width: 25 }, { width: 12 }, { width: 12 }, { width: 10 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 12 }];
  s4.addRows([
    ['Maintenance / Repair', 'Yes/No', 'Comments'],
    ['Are repair requests completed by Clinical Staff', '', ''],
    ['Are repair requests completed by Biomed Staff', '', ''],
    ['Machine external visual inspection and are backs clean', '', ''],
    ['Bicarb / Concentrate Central Feed System present', '', ''],
    ['Machine PMs completed per schedule', '', ''],
    [],
    ['Machine Maintenance / Repair'],
    ['Machine Number', 'Serial Number', 'Mach Type', 'Dates (SA)', 'Dates (A)', 'Diasafe', 'Elec Safety', 'WOs in Binder', 'Rendevor Tag #', 'Machine Hours'],
    ...Array.from({ length: 20 }, (_, i) => [i + 1, '', '', '', '', '', '', '', '', '']),
    [],
    ['Comments:'],
  ]);
  bold(s4, 1, 8, 9);
  dv(s4, 'B2:B6');
  dv(s4, 'C10:C29', sel('Fresenius 2008T BiBag,Fresenius 2008K'));
  dv(s4, 'F10:F29');
  dv(s4, 'G10:G29');
  dv(s4, 'H10:H29');

  // ── Sheet 5: Equipment Info ────────────────────────────────────────────────
  const s5 = wb.addWorksheet('Equipment Info');
  s5.columns = [{ width: 30 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 15 }, { width: 12 }];
  s5.addRows([
    ['Equipment Information'],
    ['Description', 'Manufacturer', 'Model #', 'Serial #', 'Asset #', 'Hours'],
    ...Array.from({ length: 9 }, (_, i) => [`RO${i + 1}`, '', '', '', '', '']),
    [],
    ['Equipment Information'],
    ['Description', 'Manufacturer', 'Model #', 'Serial #', 'Asset #', 'Hours'],
    ...Array.from({ length: 17 }, (_, i) => [`DIALYSIS CHAIR #${i + 1}`, '', '', '', '', '']),
    ['DIALYSIS CHAIR ISO', '', '', '', '', ''],
    ['Acid Mixer', '', '', '', '', ''],
    ['Bicarb Mixer', '', '', '', '', ''],
    ['Myron L Meter #1', '', '', '', '', ''],
    ['Myron L Meter #2', '', '', '', '', ''],
  ]);
  bold(s5, 1, 2, 13, 14);
  dv(s5, 'B3:B11', sel('MarCor/Evoqua'));
  dv(s5, 'C3:C11', sel('4400,700 Series,Millennium'));
  dv(s5, 'B15:B32', sel('Lumex,WinCo,Drive'));
  dv(s5, 'C15:C32', sel('6950,6530,6540,D577'));
  dv(s5, 'B33:B33', sel('Fresenius'));
  dv(s5, 'B34:B34', sel('Ameriwater'));
  dv(s5, 'B35:B36', sel('Myron L'));

  // ── Sheet 6: Safety Audit ─────────────────────────────────────────────────
  const s6 = wb.addWorksheet('Safety Audit');
  s6.columns = [{ width: 65 }, { width: 12 }, { width: 30 }];
  s6.addRows([
    ['Safety Audit'],
    ['Facility:', '', 'Date:'],
    ['Person Completing Audit:', ''],
    [],
    ['General Safety', 'Yes/No', 'Comments'],
    ['Temperature in facility is set to appropriate level.', '', ''],
    ['Work areas are properly lit.', '', ''],
    ['Emergency supplies are close by and easily accessible.', '', ''],
    ['ALL chairs are intact and in good working condition.', '', ''],
    ['ALL equipment is clean and functioning properly. (This includes the back of machine)', '', ''],
    ['ALL machine wheels are in working order.', '', ''],
    ['Machine paint is intact on ALL machines.', '', ''],
    ['Chux are used on machine bases.', '', ''],
    ['Floor in treatment and water rooms are dry without any leaks, spills or water.', '', ''],
    ['ALL employees are wearing safe shoes according to policy ADMIN-01-091.', '', ''],
    ['All needles have safety locks and are engaged and used properly.', '', ''],
    ['Storage room/area is neatly organized and is free from clutter and stacking hazards.', '', ''],
    [],
    ['Electrical Safety', 'Yes/No', 'Comments'],
    ['ALL outlets and equipment are properly grounded.', '', ''],
    ['Power cords present do not have any defects.', '', ''],
    ['ALL power cords in use are out of the way from work and foot traffic areas.', '', ''],
    ['Extension cords are NOT in use.', '', ''],
    [],
    ['Fire Safety', 'Yes/No', 'Comments'],
    ['Fire extinguishers are present and visible.', '', ''],
    ['Fire extinguishers are up to date with inspections.', '', ''],
    ['ALL fire exits are clearly marked.', '', ''],
    ['ALL fire exits are clear and not blocked.', '', ''],
    ['Smoke detectors are present.', '', ''],
    ['ALL smoke detectors are functioning properly.', '', ''],
    [],
    ['Hazardous Materials Safety', 'Yes/No', 'Comments'],
    ['Food is kept separate from hazardous materials.', '', ''],
    ['ALL hazardous materials are clearly labeled.', '', ''],
    ['Hazardous material storage location is clearly indicated for use.', '', ''],
    ['Biohazard material disposal process is followed per facility guidelines.', '', ''],
    ['PPE is present and in appropriate amounts for ALL staff.', '', ''],
    ['Spill kit is present.', '', ''],
    ['ALL contents in spill kit are current. (No expired items)', '', ''],
    ['Eyewash station is present and functional. (Eyewash bottles present if applicable)', '', ''],
    ['ALL employees noted to be utilizing appropriate PPE when handling hazardous materials.', '', ''],
    ['Oxygen cylinders are secured per facility protocol. (If applicable)', '', ''],
    [],
    ['Other Safety', 'Yes/No', 'Comments'],
    ['ALL restrooms are clean.', '', ''],
    ['Appropriate amounts of soap and towels are present.', '', ''],
    ['Unit is cleaned appropriately after each treatment day.', '', ''],
    ['Walls, floor and equipment are free from blood splatters.', '', ''],
  ]);
  bold(s6, 1, 5, 19, 25, 33, 45);
  dv(s6, 'B6:B17'); dv(s6, 'B20:B23'); dv(s6, 'B26:B31'); dv(s6, 'B34:B43'); dv(s6, 'B46:B49');

  // ── Sheet 7: Comments ─────────────────────────────────────────────────────
  const s7 = wb.addWorksheet('Comments');
  s7.columns = [{ width: 50 }];
  s7.addRows([
    ['Rendevor Dialysis Inc.'],
    ['Annual Technical Audit'],
    ['Comments:'],
    ...Array.from({ length: 20 }, () => ['']),
    ['Audit Conducted By:', '', '', '', '', '', 'Date:'],
  ]);
  bold(s7, 1, 2, 3);

  // ── Trigger download ───────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'BioMed_Audit_Template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadCustomTemplate(template) {
  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();

  for (const section of template.sections) {
    const ws = wb.addWorksheet(section.name.slice(0, 31));
    let rowIdx = 1;

    ws.getRow(rowIdx).values = [section.name];
    ws.getRow(rowIdx).font = { bold: true, size: 13 };
    rowIdx += 2;

    for (const group of section.groups) {
      ws.getRow(rowIdx).values = [group.name];
      ws.getRow(rowIdx).font = { bold: true };
      rowIdx++;

      for (const q of group.questions) {
        if (q.type === 'yn') {
          ws.getRow(rowIdx).values = [q.text, 'Yes / No / N/A', ''];
          rowIdx++;
        } else if (q.type === 'text' || q.type === 'number') {
          ws.getRow(rowIdx).values = [q.text, ''];
          rowIdx++;
        } else if (q.type === 'item-table') {
          ws.getRow(rowIdx).values = [q.text];
          ws.getRow(rowIdx).font = { italic: true };
          rowIdx++;
          if (q.columns?.length) {
            ws.getRow(rowIdx).values = q.columns.map(c => c.name);
            ws.getRow(rowIdx).font = { bold: true };
            rowIdx++;
            for (let i = 0; i < 5; i++) rowIdx++;
          }
        }
      }
      rowIdx++;
    }

    ws.getColumn(1).width = 55;
    ws.getColumn(2).width = 20;
    ws.getColumn(3).width = 25;
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob2 = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url2 = URL.createObjectURL(blob2);
  const a2 = document.createElement('a');
  a2.href = url2;
  a2.download = `${template.name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')}_Template.xlsx`;
  a2.click();
  URL.revokeObjectURL(url2);
}

function StatusDot({ status }) {
  const colors = {
    'not-started': 'bg-red-500',
    'in-progress': 'bg-amber-400',
    'submitted': 'bg-green-mid',
    'needs-poc': 'bg-amber-400',
  };
  return <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[status] || 'bg-gray-300'}`} />;
}

function InProgressIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Dotted outer circle */}
      <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
      {/* Clock hands */}
      <line x1="12" y1="12" x2="12" y2="7" />
      <line x1="12" y1="12" x2="16" y2="12" />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1" fill="#92400e" stroke="none" />
    </svg>
  );
}

function PocRow({ poc, onUpdate, onUpdateStatus }) {
  const [showDetail, setShowDetail] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const isOverdue = poc.status === 'incomplete' && poc.dueDate && new Date(poc.dueDate) < new Date();
  const statusColors = {
    complete: 'text-green-800 bg-green-100',
    Complete: 'text-green-800 bg-green-100',
    incomplete: isOverdue ? 'text-red-800 bg-red-50' : 'text-amber-800 bg-amber-50',
    Incomplete: isOverdue ? 'text-red-800 bg-red-50' : 'text-amber-800 bg-amber-50',
  };
  const photoCount = poc.photos?.length || 0;
  const statusLabel = isOverdue ? 'Incomplete (overdue)' : poc.status;
  return (
    <>
      <div className="bg-gray-50 rounded-lg border border-gray-100 mb-2 text-xs">
        <div className="flex items-center gap-4 px-3 py-2.5">
          <StatusDot status={poc.status === 'complete' || poc.status === 'Complete' ? 'submitted' : isOverdue ? 'not-started' : 'in-progress'} />
          <div className="flex-1 min-w-0">
            <div className="text-gray-800 font-medium truncate">{poc.text}</div>
            <div className="text-gray-500">{poc.section}</div>
          </div>
          <div className="text-gray-500 w-28">Assigned: <span className="text-gray-700">{poc.assignee}</span></div>
          <div className={`w-28 ${isOverdue ? 'text-red-700 font-medium' : 'text-gray-500'}`}>
            {poc.dueDate} {isOverdue && '(overdue)'}
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[poc.status] || 'text-gray-600 bg-gray-100'}`}>
            {statusLabel}
          </span>
          {photoCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
              {photoCount}
            </span>
          )}
          <button
            onClick={() => setShowDetail(true)}
            className="px-3 py-1 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-100 whitespace-nowrap"
          >
            Plan Details
          </button>
          <button
            onClick={() => setShowUpdateStatus(true)}
            className="px-3 py-1 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-100 whitespace-nowrap"
          >
            Update Status
          </button>
        </div>
      </div>
      {showDetail && (
        <PocDetailModal
          poc={poc}
          onSave={onUpdate}
          onClose={() => setShowDetail(false)}
        />
      )}
      {showUpdateStatus && (
        <UpdateStatusModal
          poc={poc}
          onSave={onUpdateStatus}
          onClose={() => setShowUpdateStatus(false)}
        />
      )}
    </>
  );
}

function EventRow({ event }) {
  const ts = new Date(event.timestamp);
  const dateStr = ts.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = ts.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const noteText = `${event.pocText}: ${event.previousStatus} → ${event.newStatus}${event.note ? `. ${event.note}` : ''}`;
  return (
    <div className="grid grid-cols-[160px_140px_140px_1fr] px-3 py-2.5 border-b border-gray-50 last:border-0 items-start hover:bg-gray-50 transition-colors">
      <span className="text-gray-500">{dateStr} <span className="text-gray-400">{timeStr}</span></span>
      <span className="text-gray-700">{event.user}</span>
      <span className="text-gray-700">{event.type}</span>
      <span className="text-gray-600 leading-relaxed">{noteText}</span>
    </div>
  );
}

function AuditRow({ audit, onOpen }) {
  const { updateAudit } = useAudit();
  const [expanded, setExpanded] = useState(audit.id === 'a3');
  const isInProgress = audit.status === 'in-progress';
  const hasPoc = audit.pocItems && audit.pocItems.length > 0;

  function handleUpdatePoc(updatedPoc) {
    const pocItems = audit.pocItems.map(p => p.id === updatedPoc.id ? updatedPoc : p);
    updateAudit(audit.id, { pocItems });
  }

  function handleUpdateStatus(updatedPoc, event) {
    const pocItems = audit.pocItems.map(p => p.id === updatedPoc.id ? updatedPoc : p);
    const eventHistory = [...(audit.eventHistory || []), { ...event, user: event.user ?? audit.auditor }];
    updateAudit(audit.id, { pocItems, eventHistory });
  }

  return (
    <div className={`rounded-xl overflow-hidden mb-2 transition-all ${expanded ? 'border-2 border-green-dark shadow-md' : 'border border-gray-200'}`}>
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none ${expanded ? 'bg-green-dark text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
        onClick={() => setExpanded(!expanded)}
      >
        {isInProgress ? (
          <span className={expanded ? 'text-amber-300' : 'text-amber-500'}>
            <InProgressIcon />
          </span>
        ) : (
          <StatusDot status={audit.status} />
        )}
        <span className="flex-1 text-sm font-medium">{audit.name}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {expanded && (
        <div className="px-4 py-3 border-t border-green-dark/20">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
            <span><strong className="text-gray-700">Auditor:</strong> {audit.auditor}</span>
            <span><strong className="text-gray-700">Date Created:</strong> {audit.createdAt}</span>
            <span><strong className="text-gray-700">Facility:</strong> {audit.facility}</span>
            <span><strong className="text-gray-700">Audit Status:</strong> {isInProgress ? 'In Progress' : audit.status === 'complete' ? 'Complete' : audit.status}</span>
            {isInProgress && (
              <span className="ml-auto text-amber-700 font-medium">
                {audit.sectionsComplete} of {audit.totalSections} sections complete
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {isInProgress && (
              <button onClick={() => onOpen(audit)} className="px-3 py-1.5 text-xs border border-green-mid text-green-mid rounded-lg hover:bg-green-50 font-medium">Continue Audit</button>
            )}
            <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Manage Documents</button>
            <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Add Plan of Corrections</button>
            <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Audit Notes</button>
            <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Close Audit</button>
            <button className="px-3 py-1.5 text-xs border border-red-200 text-red-700 rounded-lg hover:bg-red-50 ml-auto flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
              Delete Audit
            </button>
          </div>

          {hasPoc && (
            <>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Plan of Corrections</div>
              {audit.pocItems.map(poc => <PocRow key={poc.id} poc={poc} onUpdate={handleUpdatePoc} onUpdateStatus={handleUpdateStatus} />)}
            </>
          )}

          {(audit.eventHistory?.length > 0) && (
            <>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 mt-4">All Event History</div>
              <div className="rounded-lg border border-gray-100 overflow-hidden text-xs">
                <div className="grid grid-cols-[160px_140px_140px_1fr] bg-gray-50 border-b border-gray-100 px-3 py-2 text-gray-400 font-medium uppercase tracking-wide">
                  <span>Timestamp</span>
                  <span>User</span>
                  <span>Type</span>
                  <span>Note</span>
                </div>
                {[...audit.eventHistory].reverse().map(ev => (
                  <EventRow key={ev.id} event={ev} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { audits, auditTemplates } = useAudit();
  const [startOpen, setStartOpen] = useState(true);
  const [tab, setTab] = useState('my');
  const [showBiomedModal, setShowBiomedModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [customTemplateModal, setCustomTemplateModal] = useState(null);

  function handleOpenAudit(audit) {
    navigate(`/audit/${audit.id}`);
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 pt-3 border-b border-gray-100">
          <div className="text-xs text-gray-400 flex items-center gap-1 mb-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            Audit Center
          </div>
          <div className="text-xl font-medium text-gray-900 pb-2.5">Audit Center Home</div>
          <div className="flex">
            {[['my','My Open Audits & PoCs'],['team','Open Audits at My Facilities'],['historical','Closed Audits']].map(([k,l]) => (
              <div key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm cursor-pointer border-b-2 ${tab===k ? 'text-gray-900 border-green-mid font-medium' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>{l}</div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Sort By: Status','Sort By: Audit Type','Sort By: Facility'].map(f => (
              <button key={f} className="px-3 py-1 border border-gray-200 rounded-full text-xs text-gray-500 flex items-center gap-1 hover:border-gray-300">
                {f} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            ))}
            <div className="px-3 py-1 border border-gray-200 rounded-full text-xs text-gray-400 flex items-center gap-2">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Search by Person
            </div>
          </div>

          <div className={`rounded-xl overflow-hidden mb-3 ${startOpen ? '' : ''}`}>
            <div
              className="bg-green-mid px-4 py-3 flex justify-between items-center cursor-pointer"
              onClick={() => setStartOpen(!startOpen)}
            >
              <span className="text-white text-sm font-medium">Start New Audit</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className={`transition-transform ${startOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {startOpen && (
              <div className="bg-gray-50 border border-gray-200 border-t-0 rounded-b-xl px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowBiomedModal(true)}
                    className="px-4 py-2 border border-gray-200 text-sm rounded-lg text-gray-600 hover:bg-white font-medium"
                  >
                    BioMed Audit
                  </button>
                  <button className="px-4 py-2 border border-gray-200 text-sm rounded-lg text-gray-600 hover:bg-white font-medium">
                    Clinical Audit
                  </button>
                  <button className="px-4 py-2 border border-dashed border-green-mid text-sm rounded-lg text-green-mid hover:bg-green-50 font-medium flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload Custom Audit
                  </button>
                  {auditTemplates.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => setCustomTemplateModal(tpl)}
                      className="px-4 py-2 border border-gray-200 text-sm rounded-lg text-gray-600 hover:bg-white text-left"
                    >
                      <div className="font-medium">{tpl.name}</div>
                      {tpl.description && <div className="text-xs text-gray-400 mt-0.5">{tpl.description}</div>}
                    </button>
                  ))}
                  <button
                    onClick={() => navigate('/builder')}
                    className="px-4 py-2 border border-dashed border-green-mid text-sm rounded-lg text-green-mid hover:bg-green-50 font-medium flex items-center gap-1.5"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Build New Audit
                  </button>
                </div>
              </div>
            )}
          </div>

          {audits.map(audit => (
            <AuditRow key={audit.id} audit={audit} onOpen={handleOpenAudit} />
          ))}
        </div>
      </div>

      {showBiomedModal && (
        <BiomedForkModal
          audits={audits.filter(a => a.type === 'biomed' && a.status === 'in-progress')}
          onClose={() => setShowBiomedModal(false)}
          onContinue={(audit) => { setShowBiomedModal(false); navigate(`/audit/${audit.id}`); }}
          onStartNew={() => { setShowBiomedModal(false); navigate('/audit/new'); }}
          onUpload={() => { setShowBiomedModal(false); setShowUploadModal(true); }}
          onPrintBlank={() => { setShowBiomedModal(false); navigate('/audit/blank/print'); }}
          onPaperOcr={() => { setShowBiomedModal(false); navigate('/audit/new', { state: { openOcr: true } }); }}
          onDownloadTemplate={downloadBiomedTemplate}
          onEditAudit={() => { setShowBiomedModal(false); navigate('/builder', { state: { editName: 'BioMed Audit', editDescription: 'Rendevor Dialysis — Annual Technical Audit', editSections: BIOMED_SECTIONS } }); }}
        />
      )}

      {showUploadModal && (
        <UploadAuditModal onClose={() => setShowUploadModal(false)} />
      )}

      {customTemplateModal && (
        <CustomAuditForkModal
          template={customTemplateModal}
          audits={audits}
          onClose={() => setCustomTemplateModal(null)}
          onContinue={(audit) => { setCustomTemplateModal(null); navigate(`/audit/${audit.id}`); }}
          onStartNew={() => { setCustomTemplateModal(null); navigate('/audit/new', { state: { templateId: customTemplateModal.id } }); }}
          onDownloadTemplate={() => downloadCustomTemplate(customTemplateModal)}
          onPrintBlank={() => { const t = customTemplateModal; setCustomTemplateModal(null); navigate('/audit/blank/print', { state: { templateSections: t.sections, templateName: t.name } }); }}
          onUpload={() => { setCustomTemplateModal(null); setShowUploadModal(true); }}
          onPaperOcr={() => { setCustomTemplateModal(null); navigate('/audit/new', { state: { openOcr: true } }); }}
        />
      )}
    </div>
  );
}

function CustomAuditForkModal({ template, audits, onClose, onContinue, onStartNew, onDownloadTemplate, onPrintBlank, onUpload, onPaperOcr }) {
  const drafts = audits.filter(a => a.templateId === template.id && a.status === 'in-progress');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef();

  function addFiles(incoming) {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...Array.from(incoming).filter(f => !existing.has(f.name + f.size))];
    });
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  function handleUpload() {
    if (!files.length) return;
    const hasExcel = files.some(f => /\.(xlsx?)$/i.test(f.name));
    const hasImages = files.some(f => f.type.startsWith('image/') || /\.pdf$/i.test(f.name));
    if (hasExcel && !hasImages) { onUpload(); } else { onPaperOcr(); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-xl">
        <div className="bg-green-dark px-5 py-4 flex items-start justify-between">
          <div>
            <div className="text-white font-medium text-base">{template.name}</div>
            {template.description && <div className="text-white/60 text-xs mt-0.5">{template.description}</div>}
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white mt-0.5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {drafts.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Resume in-progress ({drafts.length})</div>
              {drafts.map(audit => {
                const pct = Math.round((audit.sectionsComplete / audit.totalSections) * 100);
                return (
                  <div key={audit.id} className="border border-gray-200 rounded-xl p-3 mb-2 flex items-center gap-3 hover:border-green-mid cursor-pointer transition-colors" onClick={() => onContinue(audit)}>
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27500a" strokeWidth="1.5"><path d="M9 12h6M9 16h4M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{audit.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{audit.sectionsComplete} of {audit.totalSections} sections · updated {audit.updatedAt}</div>
                      <div className="h-1 bg-gray-100 rounded-full mt-1.5"><div className="h-1 bg-green-mid rounded-full" style={{ width: `${pct}%` }} /></div>
                    </div>
                    <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                      <InProgressIcon /> In progress
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Start a new audit</div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={onStartNew} className="border border-gray-200 rounded-xl p-3.5 text-left hover:border-green-mid hover:bg-green-50/40 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center mb-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27500a" strokeWidth="1.5"><path d="M9 12h6M9 16h4M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/><line x1="12" y1="7" x2="12" y2="3"/><line x1="9" y1="7" x2="15" y2="7"/></svg>
                </div>
                <div className="text-sm font-medium text-gray-900 mb-0.5">Digital Audit</div>
                <div className="text-xs text-gray-400 leading-relaxed">Complete section by section in-browser.</div>
              </button>
              <button onClick={onDownloadTemplate} className="border border-gray-200 rounded-xl p-3.5 text-left hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center mb-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0c447c" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
                </div>
                <div className="text-sm font-medium text-gray-900 mb-0.5">Excel Audit</div>
                <div className="text-xs text-gray-400 leading-relaxed">Download template and fill out offline.</div>
              </button>
              <button onClick={onPrintBlank} className="border border-gray-200 rounded-xl p-3.5 text-left hover:border-amber-400 hover:bg-amber-50/40 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center mb-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                </div>
                <div className="text-sm font-medium text-gray-900 mb-0.5">Paper Audit</div>
                <div className="text-xs text-gray-400 leading-relaxed">Print blank form and fill out on-site.</div>
              </button>
            </div>
          </div>

          {/* Upload a completed audit */}
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Upload a completed audit</div>
            <div
              className={`border-2 border-dashed rounded-xl p-4 transition-colors ${isDragging ? 'border-green-mid bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
            >
              {files.length === 0 ? (
                <div className="text-center py-2">
                  <svg className="mx-auto mb-2 text-gray-300" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <div className="text-xs text-gray-500">Drop files here or <button className="text-green-mid underline" onClick={() => fileRef.current.click()}>browse</button></div>
                  <div className="text-xs text-gray-400 mt-0.5">Excel, JPG, PNG, PDF · Multiple files supported</div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" className="flex-shrink-0">
                        {/\.(xlsx?)$/i.test(f.name)
                          ? <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>
                          : <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></>}
                      </svg>
                      <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
                      <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                  <button className="text-xs text-green-mid hover:underline mt-1" onClick={() => fileRef.current.click()}>+ Add more files</button>
                </div>
              )}
              <input ref={fileRef} type="file" multiple accept=".xlsx,.xls,image/*,.pdf" className="hidden" onChange={e => addFiles(e.target.files)} />
            </div>
            {files.length > 0 && (
              <button onClick={handleUpload} className="mt-2 w-full py-2 bg-green-mid text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
                Upload {files.length} file{files.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function BiomedForkModal({ audits, onClose, onContinue, onStartNew, onUpload, onPrintBlank, onPaperOcr, onDownloadTemplate, onEditAudit }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef();
  const hasDrafts = audits.length > 0;

  function addFiles(incoming) {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...Array.from(incoming).filter(f => !existing.has(f.name + f.size))];
    });
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  function handleUpload() {
    if (!files.length) return;
    const hasExcel = files.some(f => /\.(xlsx?)$/i.test(f.name));
    const hasImages = files.some(f => f.type.startsWith('image/') || /\.pdf$/i.test(f.name));
    if (hasExcel && !hasImages) { onUpload(); }
    else { onPaperOcr(); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-xl">
        <div className="bg-green-dark px-5 py-4">
          <div className="text-white font-medium text-base">BioMed Audit</div>
          <div className="text-white/60 text-xs mt-0.5">Rendevor Dialysis — Annual Technical Audit</div>
        </div>

        <div className="p-5 space-y-5">
          {/* In-progress drafts */}
          {hasDrafts && (
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Resume in-progress ({audits.length})</div>
              {audits.map(audit => {
                const pct = Math.round((audit.sectionsComplete / audit.totalSections) * 100);
                return (
                  <div key={audit.id} className="border border-gray-200 rounded-xl p-3 mb-2 flex items-center gap-3 hover:border-green-mid cursor-pointer transition-colors" onClick={() => onContinue(audit)}>
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27500a" strokeWidth="1.5"><path d="M9 12h6M9 16h4M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{audit.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{audit.sectionsComplete} of {audit.totalSections} sections · updated {audit.updatedAt}</div>
                      <div className="h-1 bg-gray-100 rounded-full mt-1.5"><div className="h-1 bg-green-mid rounded-full" style={{ width: `${pct}%` }} /></div>
                    </div>
                    <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                      <InProgressIcon /> In progress
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Start a new audit — 3 tiles */}
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Start a new audit</div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={onStartNew} className="border border-gray-200 rounded-xl p-3.5 text-left hover:border-green-mid hover:bg-green-50/40 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center mb-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27500a" strokeWidth="1.5"><path d="M9 12h6M9 16h4M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/><line x1="12" y1="7" x2="12" y2="3"/><line x1="9" y1="7" x2="15" y2="7"/></svg>
                </div>
                <div className="text-sm font-medium text-gray-900 mb-0.5">Digital Audit</div>
                <div className="text-xs text-gray-400 leading-relaxed">Complete section by section in-browser.</div>
              </button>
              <button onClick={onDownloadTemplate} className="border border-gray-200 rounded-xl p-3.5 text-left hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center mb-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0c447c" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
                </div>
                <div className="text-sm font-medium text-gray-900 mb-0.5">Excel Audit</div>
                <div className="text-xs text-gray-400 leading-relaxed">Download template and fill out offline.</div>
              </button>
              <button onClick={onPrintBlank} className="border border-gray-200 rounded-xl p-3.5 text-left hover:border-amber-400 hover:bg-amber-50/40 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center mb-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                </div>
                <div className="text-sm font-medium text-gray-900 mb-0.5">Paper Audit</div>
                <div className="text-xs text-gray-400 leading-relaxed">Print blank form and fill out on-site.</div>
              </button>
            </div>
          </div>

          {/* Upload a completed audit */}
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Upload a completed audit</div>
            <div
              className={`border-2 border-dashed rounded-xl p-4 transition-colors ${isDragging ? 'border-green-mid bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
            >
              {files.length === 0 ? (
                <div className="text-center py-2">
                  <svg className="mx-auto mb-2 text-gray-300" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <div className="text-xs text-gray-500">Drop files here or <button className="text-green-mid underline" onClick={() => fileRef.current.click()}>browse</button></div>
                  <div className="text-xs text-gray-400 mt-0.5">Excel, JPG, PNG, PDF · Multiple files supported</div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" className="flex-shrink-0">
                        {/\.(xlsx?)$/i.test(f.name)
                          ? <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>
                          : <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></>}
                      </svg>
                      <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
                      <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                  <button className="text-xs text-green-mid hover:underline mt-1" onClick={() => fileRef.current.click()}>+ Add more files</button>
                </div>
              )}
              <input ref={fileRef} type="file" multiple accept=".xlsx,.xls,image/*,.pdf" className="hidden" onChange={e => addFiles(e.target.files)} />
            </div>
            {files.length > 0 && (
              <button onClick={handleUpload} className="mt-2 w-full py-2 bg-green-mid text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
                Upload {files.length} file{files.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={onEditAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Audit
          </button>
          <button onClick={onClose} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}
