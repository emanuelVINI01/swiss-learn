/**
 * Hand-drawn Alpine skyline (Matterhorn-style peak) used as hero/CTA background.
 * Replaces generic blurred gradient blobs with something that actually looks Swiss.
 */
export function MountainIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMax slice"
      className={className}
    >
      <circle cx="1120" cy="90" r="70" fill="var(--accent)" opacity="0.14" />
      <circle cx="1120" cy="90" r="30" fill="var(--secondary)" opacity="0.18" />

      {/* Far range */}
      <path
        d="M0,420 L0,260 L110,190 L210,240 L330,160 L450,230 L560,175 L670,245 L790,190 L900,255 L1020,200 L1140,260 L1260,210 L1440,250 L1440,420 Z"
        fill="var(--accent)"
        opacity="0.6"
      />

      {/* Near range with the Matterhorn-like peak */}
      <path
        d="M0,420 L0,320 L120,285 L210,330 L300,255 L390,305 L470,225 L525,165 L580,225 L640,285 L740,240 L840,310 L950,265 L1060,325 L1160,280 L1260,320 L1440,300 L1440,420 Z"
        fill="var(--swiss-red)"
        opacity="0.95"
      />

      {/* Snow cap on the tallest peak */}
      <polygon points="497,197 525,165 555,200 538,192 512,198" fill="#ffffff" opacity="0.5" />
      <polygon points="505,192 525,168 546,194 525,188" fill="#ffffff" opacity="0.95" />
    </svg>
  );
}
