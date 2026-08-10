export default function RigoraLogo({ compact = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        aria-hidden="true"
        className="h-8 w-8 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 20V4.5h8.5a4.5 4.5 0 0 1 0 9H5m7 0 7 6.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.6"
        />
        <path
          d="m15.25 4.7 4.2 3.8-4.2 3.8"
          stroke="#7C6CFF"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      </svg>
      {!compact && <span className="font-bold tracking-[0.2em]">RIGORA</span>}
    </span>
  );
}
