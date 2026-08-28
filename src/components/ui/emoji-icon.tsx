type Props = {
  emoji: string;
  size?: number;
  label?: string;
  className?: string;
};

// A colorful, human alternative to flat monochrome icon components for
// decorative badges (stat cards, achievement pills, feature markers).
export function EmojiIcon({ emoji, size = 20, label, className = "" }: Props) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`emoji-icon inline-block ${className}`}
      style={{ fontSize: size }}
    >
      {emoji}
    </span>
  );
}
