export type SiteMarkIconProps = {
  className?: string;
};

/** Inline SVG of the site mark (same artwork as `app/icon.svg`). */
export function SiteMarkIcon({ className }: SiteMarkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 190 190"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="190" height="190" rx="44" fill="url(#site-mark-bg)" />
      <g
        transform="translate(43 43) scale(4.5)"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </g>
      <defs>
        <linearGradient id="site-mark-bg" x1="0" y1="0" x2="190" y2="190" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10a37f" />
          <stop offset="1" stopColor="#0c7a5e" />
        </linearGradient>
      </defs>
    </svg>
  );
}
