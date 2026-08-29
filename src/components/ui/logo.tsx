import Link from "next/link";

/** The actual Swiss flag emblem (red square, white cross) — not a generic icon-in-a-box. */
export function SwissCrossMark({ size = 32, rounded = 8 }: { size?: number; rounded?: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size, background: "#d52b1e", borderRadius: rounded }}
    >
      <span
        className="absolute bg-white"
        style={{ width: size * 0.52, height: size * 0.16, borderRadius: 1 }}
      />
      <span
        className="absolute bg-white"
        style={{ width: size * 0.16, height: size * 0.52, borderRadius: 1 }}
      />
    </div>
  );
}

export function Logo({
  href,
  size = 32,
  textSize = "text-lg",
}: {
  href?: string;
  size?: number;
  textSize?: string;
}) {
  const content = (
    <span className="flex items-center gap-2">
      <SwissCrossMark size={size} />
      <span className={`font-bold text-[var(--fg)] ${textSize} whitespace-nowrap`}>
        Swiss<span className="text-[var(--accent)]">Learn</span>
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="group flex items-center gap-2 transition-transform hover:scale-[1.02]">
      {content}
    </Link>
  );
}
