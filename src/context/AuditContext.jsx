import { createContext, useContext, useState } from 'react';

const AuditContext = createContext(null);

export function AuditProvider({ children }) {
  const [audits, setAudits] = useState([
    {
      id: 'a1',
      name: 'Laurel Highlands — BioMed Audit',
      type: 'biomed',
      facility: 'Laurel Highlands',
      auditor: 'Alice Abbott',
      status: 'in-progress',
      createdAt: '2026-04-18',
      updatedAt: '2026-04-18',
      sectionsComplete: 3,
      totalSections: 7,
      answers: {},
      pocItems: [],
      eventHistory: [],
    },
    {
      id: 'a2',
      name: 'CCC Facility / Clinical Audit / Q3 2025',
      type: 'clinical',
      facility: 'CCC Facility',
      auditor: 'Brian Burke',
      status: 'not-started',
      createdAt: '2026-01-07',
      updatedAt: '2026-01-07',
      sectionsComplete: 0,
      totalSections: 5,
      answers: {},
      pocItems: [],
      eventHistory: [],
    },
    {
      id: 'a3',
      name: 'CCC Facility / BioMed Audit / Q3 2025',
      type: 'biomed',
      facility: 'CCC Facility',
      auditor: 'Brian Burke',
      status: 'in-progress',
      createdAt: '2026-01-07',
      updatedAt: '2026-01-07',
      sectionsComplete: 5,
      totalSections: 7,
      answers: {},
      pocItems: [
        { id: 'p1', section: 'Safety Audit / Fire Safety', text: 'Fire extinguishers are present and visible.', assignee: 'Brian Burke', dueDate: '2026-07-02', status: 'incomplete', emergency: false, plan: '', photos: [] },
        { id: 'p2', section: 'Safety Audit / Fire Safety', text: 'First aid kit supplies are present and visible.', assignee: 'Brian Burke', dueDate: '2026-07-15', status: 'incomplete', emergency: false, plan: '', photos: [] },
        { id: 'p3', section: 'Safety Audit / Fire Safety', text: 'Exit signs are posted clearly in facility.', assignee: 'Brian Burke', dueDate: '2026-07-15', status: 'complete', emergency: false, plan: '', photos: [] },
      ],
      eventHistory: [],
    },
    {
      id: 'a4',
      name: 'BBB Facility / Clinical Audit / Q3 2025',
      type: 'clinical',
      facility: 'BBB Facility',
      auditor: 'Brian Burke',
      status: 'in-progress',
      createdAt: '2026-01-07',
      updatedAt: '2026-01-07',
      sectionsComplete: 2,
      totalSections: 5,
      answers: {},
      pocItems: [],
      eventHistory: [],
    },
  ]);

  const [currentAudit, setCurrentAudit] = useState(null);

  function createAudit(data) {
    const newAudit = {
      id: 'a' + Date.now(),
      name: `${data.facility} — BioMed Audit`,
      type: 'biomed',
      facility: data.facility,
      auditor: data.auditor || 'Alice Abbott',
      status: 'in-progress',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      sectionsComplete: 0,
      totalSections: 7,
      answers: {},
      pocItems: [],
      eventHistory: [],
    };
    setAudits(prev => [newAudit, ...prev]);
    return newAudit;
  }

  function updateAudit(id, updates) {
    setAudits(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : a));
  }

  function submitAudit(id, pocItems) {
    setAudits(prev => prev.map(a => a.id === id ? {
      ...a,
      status: pocItems.length > 0 ? 'needs-poc' : 'submitted',
      pocItems,
      updatedAt: new Date().toISOString().split('T')[0],
    } : a));
  }

  function createUploadedAudit({ name, facility, auditor, pocItems }) {
    const today = new Date().toISOString().split('T')[0];
    const newAudit = {
      id: 'a' + Date.now(),
      name,
      type: 'biomed',
      facility,
      auditor,
      status: pocItems.length > 0 ? 'needs-poc' : 'submitted',
      createdAt: today,
      updatedAt: today,
      sectionsComplete: 7,
      totalSections: 7,
      answers: {},
      pocItems,
      eventHistory: [],
    };
    setAudits(prev => [newAudit, ...prev]);
    return newAudit;
  }

  return (
    <AuditContext.Provider value={{ audits, setAudits, currentAudit, setCurrentAudit, createAudit, updateAudit, submitAudit, createUploadedAudit }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  return useContext(AuditContext);
}
