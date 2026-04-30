export default function Sidebar() {
  return (
    <div className="w-14 bg-green-dark flex flex-col items-center py-3 gap-2 flex-shrink-0">
      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center mb-2">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <circle cx="6" cy="6" r="3" fill="rgba(255,255,255,0.7)" />
          <circle cx="14" cy="6" r="3" fill="rgba(255,255,255,0.4)" />
          <circle cx="6" cy="14" r="3" fill="rgba(255,255,255,0.4)" />
          <circle cx="14" cy="14" r="3" fill="rgba(255,255,255,0.7)" />
        </svg>
      </div>
      <div className="w-8 h-8 rounded-full bg-green-light flex items-center justify-center text-white text-xs font-medium">CC</div>
      {[
        <svg key="grid" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
        <svg key="loc" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>,
        <svg key="table" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
        <svg key="doc" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6M9 16h4M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>,
      ].map((icon, i) => (
        <div key={i} className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer text-white/55 hover:bg-white/10 hover:text-white/90">
          {icon}
        </div>
      ))}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer bg-white/12 text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
      </div>
      <div className="mt-auto w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer text-white/55 hover:bg-white/10 hover:text-white/90">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      </div>
    </div>
  );
}
