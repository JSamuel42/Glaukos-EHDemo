export default function BestInClassBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 ring-1 ring-amber-300"
      title="Best in class for this dimension based on the available evidence"
    >
      <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
        <path
          d="M6 0.5l1.5 4 4 0.3-3 2.8 1 4-3.5-2-3.5 2 1-4-3-2.8 4-0.3z"
          fill="currentColor"
        />
      </svg>
      Best
    </span>
  );
}
