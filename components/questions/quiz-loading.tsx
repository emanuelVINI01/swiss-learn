import { BookOpen } from "lucide-react";

type Props = {
  label: string;
};

export default function QuizLoading({ label }: Props) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex items-center gap-3 text-[var(--fg-muted)]">
        <BookOpen size={20} className="animate-pulse" />
        <span>{label}</span>
      </div>
    </div>
  );
}
