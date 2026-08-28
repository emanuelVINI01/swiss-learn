"use client";

import AppShell from "@/components/ui/app-shell";
import { useQuizSession } from "@/hooks/use-quiz-session";
import StudyMenu from "./study-menu";
import QuizLoading from "./quiz-loading";
import QuizResults from "./quiz-results";
import QuizPlaying from "./quiz-playing";
import type { TargetLang } from "./types";

type Props = {
  dict: any;
  lang: string;
  targetLang: TargetLang;
};

export default function QuestionsClient({ dict, lang, targetLang }: Props) {
  const {
    view,
    quiz,
    promptModes,
    current,
    answering,
    finishing,
    showCategory,
    result,
    shuffling,
    showOtherOptions,
    startStudy,
    handleShuffle,
    handleSelect,
    handleNext,
    toggleCategory,
    backToMenu,
  } = useQuizSession(targetLang);

  return (
    <AppShell lang={lang} dict={dict}>
      {view === "menu" && <StudyMenu dict={dict} onStart={startStudy} />}

      {view === "loading" && (
        <QuizLoading
          label={dict.questions.loading}
          otherOptionsLabel={dict.questions.otherOptions}
          onOtherOptions={showOtherOptions}
        />
      )}

      {view === "finished" && result && (
        <QuizResults dict={dict} lang={lang} result={result} onPlayAgain={backToMenu} />
      )}

      {view === "playing" && quiz && quiz.questions[current] && (
        <QuizPlaying
          dict={dict}
          quiz={quiz}
          current={current}
          answering={answering}
          finishing={finishing}
          showCategory={showCategory}
          promptMode={promptModes[current] ?? "text"}
          shuffling={shuffling}
          onBack={backToMenu}
          onToggleCategory={toggleCategory}
          onSelect={handleSelect}
          onNext={handleNext}
          onShuffle={handleShuffle}
        />
      )}
    </AppShell>
  );
}
