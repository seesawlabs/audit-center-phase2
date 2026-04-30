# Audit Center Phase II — Project Handoff

## Project Overview
React + Tailwind prototype for an internal healthcare audit management tool called **InSites**. This project adds a BioMed Audit digital experience to an existing "Audit Center" feature.

## Stack
- React + Vite
- Tailwind CSS v3
- React Router DOM

## Color Scheme
- Dark green sidebar/headers: `#1e3a2f`
- Primary green (buttons, accents): `#2d6a4f`
- Status colors: red = not started, amber = in progress, green = complete

## What's Built

### Pages
- **Home** (`/`) — Audit Center hub with audit list, status indicators, expandable rows, PoC tracking table, BioMed/Clinical audit buttons
- **NewAudit** (`/audit/new`) — Facility and auditor setup before starting a digital audit
- **AuditForm** (`/audit/:id`) — Full in-app BioMed audit with 7 tabbed sections, group-by-group navigation, Yes/No/N/A, numeric, text, and calculated question types (EBCT and % Rejection auto-calculate)
- **PocFlow** (`/audit/:id/poc`) — Plan of Correction flow, walks through each flagged "No" answer one at a time before final submission
- **UploadAudit** (`/upload`) — 3-step modal for uploading a completed Excel audit file

### Key Features
- Fork modal on home screen detects existing in-progress drafts and surfaces them with progress bars
- Auto-save with Save & Exit returns user to home screen
- "No" answers in the audit form flag inline and get collected for PoC at submission
- PoC flow walks through each flagged item individually (corrective action, assignee, due date, status, emergency toggle)
- Global state via React Context (AuditContext)

### Data
- BioMed audit sections and questions defined in `src/data/biomedAudit.js`
- 7 sections: Supplies & Equipment, Water Treatment, Physical Plant & HMIS, HD Machines, Equipment Info, Safety Audit, Comments
- Global audit state managed in `src/context/AuditContext.jsx`

## What Needs Work
Continue improving and refining the prototype based on feedback from reviewing the running app.
