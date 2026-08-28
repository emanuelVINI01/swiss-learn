import { BookOpen } from "lucide-react";

type Props = {
  label: string;
  otherOptionsLabel?: string;
  onOtherOptions?: () => void;
};

export default function QuizLoading({ label, otherOptionsLabel, onOtherOptions }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-3 text-[var(--fg-muted)]">
        <BookOpen size={20} className="animate-pulse" />
        <span>{label}</span>
      </div>
      {onOtherOptions && otherOptionsLabel && (
        <button
          onClick={onOtherOptions}
          className="text-sm font-medium text-[var(--fg-muted)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
        >
          {otherOptionsLabel}
        </button>
      )}
    </div>
  );
}
