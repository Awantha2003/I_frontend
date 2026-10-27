export default function Logo({ size = 46, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
        <path d="M24 4 41 14v20L24 44 7 34V14z" fill="#1A8FE3" />
        <path d="M24 4 41 14 24 24 7 14z" fill="#3FB5F5" />
        <path d="M17 14v20M17 25l10-9M20 22l9 12" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M28 12 38 2" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {withText && <span className="text-xl font-semibold tracking-wide text-[#1366D9]">KANBAN</span>}
    </div>
  );
}
