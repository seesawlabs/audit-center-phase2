export const MACH_TYPE_OPTIONS = ['Fresenius 2008T BiBag', 'Fresenius 2008K'];

export const EQUIP_OPTIONS = {
  ro: {
    manufacturerOptions: ['MarCor/Evoqua'],
    modelOptions: { 'MarCor/Evoqua': ['4400', '700 Series', 'Millennium'] },
  },
  chair: {
    manufacturerOptions: ['Lumex', 'WinCo', 'Drive'],
    modelOptions: { 'Lumex': ['6950'], 'WinCo': ['6530', '6540'], 'Drive': ['D577'] },
  },
  acid_mixer: { manufacturerOptions: ['Fresenius'], modelOptions: {} },
  bicarb_mixer: { manufacturerOptions: ['Ameriwater'], modelOptions: {} },
  meter: { manufacturerOptions: ['Myron L'], modelOptions: {} },
  all: {
    manufacturerOptions: ['MarCor/Evoqua', 'Fresenius', 'Ameriwater', 'Lumex', 'WinCo', 'Drive', 'Myron L'],
    modelOptions: {
      'MarCor/Evoqua': ['4400', '700 Series', 'Millennium'],
      'Lumex': ['6950'],
      'WinCo': ['6530', '6540'],
      'Drive': ['D577'],
    },
  },
};

export const BIOMED_SECTIONS = [
  {
    id: 's1',
    name: 'Supplies & Equipment',
    groups: [
      {
        id: 'g1',
        name: 'Emergency preparedness',
        questions: [
          { id: 'q1', text: 'Emergency Evacuation Box is present and accessible.', type: 'yn' },
          { id: 'q2', text: 'Fire Extinguishers are present and visible.', type: 'yn' },
          { id: 'q2_loc', text: 'Fire Extinguisher — enter location.', type: 'text' },
          { id: 'q3', text: 'Exit Signs are posted and illuminated.', type: 'yn' },
          { id: 'q4', text: 'Evacuation Diagram is posted.', type: 'yn' },
          { id: 'q4_loc', text: 'Evacuation Diagram — enter location.', type: 'text' },
          { id: 'q5', text: 'All Conc. / Bicarb Jugs are labeled.', type: 'yn' },
        ],
      },
      {
        id: 'g2',
        name: 'Spill & safety supplies',
        questions: [
          { id: 'q6', text: 'Eyewash Station is present and functional.', type: 'yn' },
          { id: 'q6_loc', text: 'Eyewash Station — enter location.', type: 'text' },
          { id: 'q7', text: 'Blood Spill Kit is present.', type: 'yn' },
          { id: 'q8', text: 'Minncare / Peracidin Spill Kit is present.', type: 'yn' },
        ],
      },
      {
        id: 'g3',
        name: 'Myron L meters & cleaning',
        questions: [
          { id: 'q9', text: 'Number of Myron L Meters on the floor.', type: 'number' },
          { id: 'q10', text: 'ISO Meter is present.', type: 'yn' },
          { id: 'q11', text: '1% Bleach Cleaning Solution is available.', type: 'yn' },
          { id: 'q12', text: 'Measuring device for bleach solution.', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 's2',
    name: 'Water Treatment',
    groups: [
      {
        id: 'g4',
        name: 'EBCT calculation',
        questions: [
          { id: 'q13', text: 'Primary Carbon volume (CuFt).', type: 'number', varName: 'primary_carbon' },
          { id: 'q14', text: 'Secondary Carbon volume (CuFt).', type: 'number', varName: 'secondary_carbon' },
          { id: 'q15', text: 'RO Product Flow (GPM).', type: 'number', varName: 'ro_product_flow' },
          { id: 'q16', text: 'EBCT (auto-calculated). Minimum 10 minutes required. Formula: (primary_carbon + secondary_carbon) / ro_product_flow * 7.48', type: 'calculated', formula: '(primary_carbon + secondary_carbon) / ro_product_flow * 7.48', unit: 'min' },
        ],
      },
      {
        id: 'g5',
        name: 'RO % rejection',
        questions: [
          { id: 'q17', text: 'RO Feed TDS reading.', type: 'number', varName: 'ro_feed_tds' },
          { id: 'q18', text: 'RO Product TDS reading.', type: 'number', varName: 'ro_product_tds' },
          { id: 'q19', text: '% Rejection (auto-calculated). Minimum 90% required. Formula: (ro_feed_tds - ro_product_tds) / ro_feed_tds * 100', type: 'calculated', formula: '(ro_feed_tds - ro_product_tds) / ro_feed_tds * 100', unit: '%' },
        ],
      },
      {
        id: 'g6',
        name: 'Water treatment checklist',
        questions: [
          { id: 'q20', text: 'Flow Diagram and Valve Legend is posted.', type: 'yn' },
          { id: 'q20_loc', text: 'Flow Diagram / Valve Legend — enter location.', type: 'text' },
          { id: 'q21', text: 'Deionization Tank is accessible.', type: 'yn' },
          { id: 'q22', text: 'Prefilter Changed and Date Posted.', type: 'yn' },
          { id: 'q23', text: 'External Water Quality Alarm is installed.', type: 'yn' },
          { id: 'q23_loc', text: 'External Water Quality Alarm — enter location.', type: 'text' },
          { id: 'q24', text: 'Pyrogen Filter Changed and Date Posted. Periodicity: Annual / Semiannual / Quarterly.', type: 'yn' },
          { id: 'q25', text: 'Diasafe Filters are in use.', type: 'yn' },
          { id: 'q26', text: 'Water In-Service — enter number of staff who attended.', type: 'text' },
        ],
      },
      {
        id: 'g7',
        name: 'RO systems',
        questions: [
          { id: 'q36', text: 'Number of Machine Stations and number of Machines.', type: 'text' },
          { id: 'wt_ro1', text: 'RO 1', type: 'equipment-row', ...EQUIP_OPTIONS.ro },
          { id: 'wt_ro2', text: 'RO 2', type: 'equipment-row', ...EQUIP_OPTIONS.ro },
          { id: 'wt_ro3', text: 'RO 3', type: 'equipment-row', ...EQUIP_OPTIONS.ro },
          { id: 'extra_wt_ro', text: 'Additional RO units', type: 'equipment-extra' },
        ],
      },
      {
        id: 'g8',
        name: 'Water system checklist',
        questions: [
          { id: 'q37', text: 'Timer Heads / Correct Time.', type: 'yn' },
          { id: 'q38', text: 'Carbon Exchanged — enter last change date.', type: 'text' },
          { id: 'q39', text: 'Disinfection Procedure Present.', type: 'yn' },
          { id: 'q40', text: 'DI Bypass Being Disinfected.', type: 'yn' },
          { id: 'q41', text: 'EBCT Posted on Carbon Tanks.', type: 'yn' },
          { id: 'q42', text: 'Pretreatment Equipment Labeled.', type: 'yn' },
          { id: 'q43', text: 'Biomed Contact Info Available — enter Name and Phone Number.', type: 'text' },
          { id: 'q44', text: 'Emergency Water Vendor Info Available — enter Name and Phone Number.', type: 'text' },
          { id: 'q45', text: 'Last Analysis Completed — enter RO Water Date and Tap Water Date.', type: 'text' },
        ],
      },
      {
        id: 'g9',
        name: 'Operational logs',
        questions: [
          { id: 'q46', text: 'R.O. / Water Logs.', type: 'yn' },
          { id: 'q47', text: 'Bicarb Tank Disinfection Log.', type: 'yn' },
          { id: 'q48', text: 'Bicarb Jug Disinfection Log.', type: 'yn' },
          { id: 'q49', text: 'Bicarb Mixing Log.', type: 'yn' },
          { id: 'q50', text: 'Concentrate Mixing Log.', type: 'yn' },
          { id: 'q51', text: 'Conductivity Meter Log.', type: 'yn' },
          { id: 'q52', text: 'R.O. Disinfection Log.', type: 'yn' },
          { id: 'q53', text: 'Electrical Safety Check (Annual).', type: 'yn' },
          { id: 'q54', text: 'Machine Disinfection Log.', type: 'yn' },
          { id: 'q55', text: 'Compare Random Entries to Logs — enter Type, Match, and Spare results.', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 's4',
    name: 'Physical Plant & HMIS',
    groups: [
      {
        id: 'g10',
        name: 'Facility condition',
        questions: [
          { id: 'q56', text: 'Adequate Storage Space is available.', type: 'yn' },
          { id: 'q57', text: 'Ceiling is intact.', type: 'yn' },
          { id: 'q58', text: 'Flooring is intact.', type: 'yn' },
          { id: 'q59', text: 'Walls are intact.', type: 'yn' },
          { id: 'q60', text: 'Emergency Lighting / Generator is present.', type: 'yn' },
          { id: 'q61', text: 'Furniture is intact.', type: 'yn' },
          { id: 'q62', text: 'Clean Work Area.', type: 'yn' },
          { id: 'q63', text: 'Chairs are free from damage (tears, cracks, corrosion, operational).', type: 'yn' },
          { id: 'q64', text: 'Clean / Dirty Sinks Signage is posted.', type: 'yn' },
          { id: 'q65', text: 'GFI Outlets are present.', type: 'yn' },
        ],
      },
      {
        id: 'g11',
        name: 'SDS availability',
        questions: [
          { id: 'q66', text: 'Bicarb Powder / Liquid SDS is accessible.', type: 'yn' },
          { id: 'q67', text: 'Concentrate SDS is accessible.', type: 'yn' },
          { id: 'q68', text: 'Bleach SDS is accessible.', type: 'yn' },
          { id: 'q69', text: 'Vinegar SDS is accessible.', type: 'yn' },
          { id: 'q70', text: 'Minncare / Peracidin / Micro X SDS is accessible.', type: 'yn' },
          { id: 'q71', text: 'Calibration Solutions SDS is accessible (specific to facility meters).', type: 'yn' },
          { id: 'q72', text: 'Eyewash Solution SDS is accessible.', type: 'yn' },
          { id: 'q73', text: 'Drain Gel SDS is accessible.', type: 'yn' },
          { id: 'q74', text: 'PT 401 SDS is accessible.', type: 'yn' },
          { id: 'q75', text: 'Americlean A SDS is accessible.', type: 'yn' },
          { id: 'q76', text: 'Americlean B SDS is accessible.', type: 'yn' },
          { id: 'q77', text: 'Access to HCP Website is available.', type: 'yn' },
          { id: 'q78', text: 'HMIS Program is in place.', type: 'yn' },
        ],
      },
      {
        id: 'g12',
        name: 'Technical binders',
        questions: [
          { id: 'q79', text: 'Machine Binder is present and current.', type: 'yn' },
          { id: 'q80', text: 'Central Water System Binder is present.', type: 'yn' },
          { id: 'q81', text: 'Portable RO Binder is present.', type: 'yn' },
          { id: 'q82', text: 'Water Quality Binder is present.', type: 'yn' },
        ],
      },
    ],
  },
  {
    id: 's5',
    name: 'HD Machines',
    groups: [
      {
        id: 'g13',
        name: 'Maintenance checklist',
        questions: [
          { id: 'q83', text: 'Repair requests are completed by Clinical Staff.', type: 'yn' },
          { id: 'q84', text: 'Repair requests are completed by Biomed Staff.', type: 'yn' },
          { id: 'q85', text: 'Machine external visual inspection completed and backs are clean.', type: 'yn' },
          { id: 'q86', text: 'Bicarb / Concentrate Central Feed System is present.', type: 'yn' },
          { id: 'q87', text: 'Machine PMs are completed per schedule.', type: 'yn' },
        ],
      },
      {
        id: 'g14',
        name: 'Machines 1–10',
        questions: Array.from({ length: 10 }, (_, i) => ({
          id: `mach${i + 1}`,
          text: `Machine ${i + 1}`,
          type: 'machine-row',
          machTypeOptions: MACH_TYPE_OPTIONS,
        })),
      },
      {
        id: 'g14b',
        name: 'Machines 11–20',
        questions: [
          ...Array.from({ length: 10 }, (_, i) => ({
            id: `mach${i + 11}`,
            text: `Machine ${i + 11}`,
            type: 'machine-row',
            machTypeOptions: MACH_TYPE_OPTIONS,
          })),
          { id: 'extra_machines', text: 'Additional machines', type: 'machine-extra' },
        ],
      },
    ],
  },
  {
    id: 's6',
    name: 'Equipment Info',
    groups: [
      {
        id: 'g15',
        name: 'RO units',
        questions: [
          ...Array.from({ length: 9 }, (_, i) => ({
            id: `ro${i + 1}`,
            text: `RO${i + 1}`,
            type: 'equipment-row',
            ...EQUIP_OPTIONS.ro,
          })),
          { id: 'extra_ro', text: 'Additional RO units', type: 'equipment-extra' },
        ],
      },
      {
        id: 'g16',
        name: 'Dialysis chairs',
        questions: [
          ...Array.from({ length: 17 }, (_, i) => ({
            id: `chair${i + 1}`,
            text: `Dialysis Chair #${i + 1}`,
            type: 'equipment-row',
            ...EQUIP_OPTIONS.chair,
          })),
          { id: 'chair_iso', text: 'Dialysis Chair ISO', type: 'equipment-row', ...EQUIP_OPTIONS.chair },
          { id: 'extra_chairs', text: 'Additional dialysis chairs', type: 'equipment-extra' },
        ],
      },
      {
        id: 'g16b',
        name: 'Other equipment',
        questions: [
          { id: 'acid_mixer', text: 'Acid Mixer', type: 'equipment-row', ...EQUIP_OPTIONS.acid_mixer },
          { id: 'bicarb_mixer', text: 'Bicarb Mixer', type: 'equipment-row', ...EQUIP_OPTIONS.bicarb_mixer },
          { id: 'meter1', text: 'Myron L Meter #1', type: 'equipment-row', ...EQUIP_OPTIONS.meter },
          { id: 'meter2', text: 'Myron L Meter #2', type: 'equipment-row', ...EQUIP_OPTIONS.meter },
          { id: 'extra_equip', text: 'Additional equipment', type: 'equipment-extra' },
        ],
      },
    ],
  },
  {
    id: 's7',
    name: 'Safety Audit',
    groups: [
      {
        id: 'g17',
        name: 'General safety',
        questions: [
          { id: 'q102', text: 'Temperature in facility is set to appropriate level.', type: 'yn' },
          { id: 'q103', text: 'Work areas are properly lit.', type: 'yn' },
          { id: 'q104', text: 'Emergency supplies are close by and easily accessible.', type: 'yn' },
          { id: 'q105', text: 'ALL chairs are intact and in good working condition.', type: 'yn' },
          { id: 'q106', text: 'ALL equipment is clean and functioning properly (including backs of machines).', type: 'yn' },
          { id: 'q107', text: 'ALL machine wheels are in working order.', type: 'yn' },
          { id: 'q108', text: 'Machine paint is intact on ALL machines.', type: 'yn' },
          { id: 'q109', text: 'Chux are used on machine bases.', type: 'yn' },
          { id: 'q110', text: 'Floor in treatment and water rooms are dry without any leaks, spills or water.', type: 'yn' },
          { id: 'q111', text: 'ALL employees are wearing safe shoes per policy ADMIN-01-091.', type: 'yn' },
          { id: 'q112', text: 'All needles have safety locks, are engaged and used properly.', type: 'yn' },
          { id: 'q113', text: 'Storage room/area is neatly organized and free from clutter and stacking hazards.', type: 'yn' },
        ],
      },
      {
        id: 'g18',
        name: 'Electrical safety',
        questions: [
          { id: 'q114', text: 'ALL outlets and equipment are properly grounded.', type: 'yn' },
          { id: 'q115', text: 'Power cords present do not have any defects.', type: 'yn' },
          { id: 'q116', text: 'ALL power cords in use are out of the way from work and foot traffic areas.', type: 'yn' },
          { id: 'q117', text: 'Extension cords are NOT in use.', type: 'yn' },
        ],
      },
      {
        id: 'g19',
        name: 'Fire safety',
        questions: [
          { id: 'q118', text: 'Fire extinguishers are present and visible.', type: 'yn' },
          { id: 'q119', text: 'Fire extinguishers are up to date with inspections.', type: 'yn' },
          { id: 'q120', text: 'ALL fire exits are clearly marked.', type: 'yn' },
          { id: 'q121', text: 'ALL fire exits are clear and not blocked.', type: 'yn' },
          { id: 'q122', text: 'Smoke detectors are present.', type: 'yn' },
          { id: 'q123', text: 'ALL smoke detectors are functioning properly.', type: 'yn' },
        ],
      },
      {
        id: 'g20',
        name: 'Hazardous materials',
        questions: [
          { id: 'q124', text: 'Food is kept separate from hazardous materials.', type: 'yn' },
          { id: 'q125', text: 'ALL hazardous materials are clearly labeled.', type: 'yn' },
          { id: 'q126', text: 'Hazardous material storage location is clearly indicated for use.', type: 'yn' },
          { id: 'q127', text: 'Biohazard material disposal process is followed per facility guidelines.', type: 'yn' },
          { id: 'q128', text: 'PPE is present and in appropriate amounts for ALL staff.', type: 'yn' },
          { id: 'q129', text: 'Spill kit is present.', type: 'yn' },
          { id: 'q130', text: 'ALL contents in spill kit are current (no expired items).', type: 'yn' },
          { id: 'q131', text: 'Eyewash station is present and functional.', type: 'yn' },
          { id: 'q132', text: 'ALL employees are utilizing appropriate PPE when handling hazardous materials.', type: 'yn' },
          { id: 'q133', text: 'Oxygen cylinders are secured per facility protocol (if applicable).', type: 'yn' },
        ],
      },
      {
        id: 'g21',
        name: 'Other safety',
        questions: [
          { id: 'q134', text: 'ALL restrooms are clean.', type: 'yn' },
          { id: 'q135', text: 'Appropriate amounts of soap and towels are present.', type: 'yn' },
          { id: 'q136', text: 'Unit is cleaned appropriately after each treatment day.', type: 'yn' },
          { id: 'q137', text: 'Walls, floor and equipment are free from blood splatters.', type: 'yn' },
        ],
      },
    ],
  },
  {
    id: 's8',
    name: 'Comments',
    groups: [
      {
        id: 'g22',
        name: 'General comments',
        questions: [
          { id: 'q138', text: 'Additional comments or observations from this audit.', type: 'text' },
        ],
      },
    ],
  },
];

export const FACILITIES = [
  'Laurel Highlands',
  'Uniontown',
  'Somerset',
  'AAA Facility',
  'BBB Facility',
  'CCC Facility',
];

export const TEAM_MEMBERS = [
  'Alice Abbott',
  'Brian Burke',
  'Clara Cooper',
  'Derek Davis',
  'Elena Evans',
  'Frank Fletcher',
];
