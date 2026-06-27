export type SiteMarkIconProps = {
  className?: string;
};

const CENTERS = [20, 35, 50, 65, 80];

// Lit cells in path order around the "C" (top-right → top → spine → bottom).
const C_ORDER = ["3,0", "2,0", "1,0", "0,0", "0,1", "0,2", "0,3", "0,4", "1,4", "2,4", "3,4"];
const DURATION = 1.6;

/** Animated black-and-white dot-matrix "C" site mark (same artwork as `app/icon.svg`). */
export function SiteMarkIcon({ className }: SiteMarkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="100" height="100" rx="24" fill="#0a0a0a" />
      {CENTERS.map((cy, row) =>
        CENTERS.map((cx, col) => {
          const idx = C_ORDER.indexOf(`${col},${row}`);
          const lit = idx !== -1;
          return (
            <circle
              key={`${col}-${row}`}
              cx={cx}
              cy={cy}
              r={lit ? 6 : 5}
              fill="#fff"
              className={lit ? "lwc-c-dot" : undefined}
              opacity={lit ? undefined : 0.12}
              style={lit ? { animationDelay: `${(-idx * DURATION) / C_ORDER.length}s` } : undefined}
            />
          );
        })
      )}
    </svg>
  );
}
