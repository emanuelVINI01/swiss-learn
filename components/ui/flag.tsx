export const FLAGS = {
  ch: "🇨🇭",
  de: "🇩🇪",
  gb: "🇬🇧",
  br: "🇧🇷",
  us: "🇺🇸",
  it: "🇮🇹",
  fr: "🇫🇷",
} as const;

export type FlagCode = keyof typeof FLAGS;

/** Maps an app locale (en/pt/de) to the flag that best represents it. */
export const LOCALE_FLAG: Record<string, FlagCode> = {
  en: "gb",
  pt: "br",
  de: "de",
};

type Props = {
  code: FlagCode;
  size?: number;
  label?: string;
  className?: string;
};

export function Flag({ code, size = 18, label, className = "" }: Props) {
  return (
    <span
      role="img"
      aria-label={label ?? code.toUpperCase()}
      className={`flag-emoji inline-block ${className}`}
      style={{ fontSize: size }}
    >
      {FLAGS[code]}
    </span>
  );
}
