"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Eye, Shuffle } from "lucide-react";
import { playHover, playClick } from "@/lib/audio";
import WordAudioButton from "./word-audio-button";
import type { QuizDetail, PromptMode } from "./types";

type Props = {
  dict: any;
  quiz: QuizDetail;
  current: number;
  answering: boolean;
  finishing: boolean;
  showCategory: boolean;
  promptMode: PromptMode;
  shuffling: boolean;
  onBack: () => void;
  onToggleCategory: () => void;
  onSelect: (option: string) => void;
  onNext: () => void;
  onShuffle: () => void;
};

// Renders "____" inside a phrase prompt as a styled blank instead of plain underscores.
function PhrasePrompt({ text }: { text: string }) {
  const parts = text.split("____");
  if (parts.length !== 2) return <>{text}</>;
  return (
    <>
      {parts[0]}
      <span className="mx-1 inline-block border-2 border-dashed border-[var(--accent)] px-3 text-[var(--accent)]">
        ____
      </span>
      {parts[1]}
    </>
  );
}

export default function QuizPlaying({
  dict,
  quiz,
  current,
  answering,
  finishing,
  showCategory,
  promptMode,
  shuffling,
  onBack,
  onToggleCategory,
  onSelect,
  onNext,
  onShuffle,
}: Props) {
  const d = dict.questions;
  const question = quiz.questions[current];
  const isAnswered = question.selected !== null;
  const progress = quiz.questions.length > 0 ? (current / quiz.questions.length) * 100 : 0;
  const isPhrase = question.questionType !== "word";
  const instruction = question.questionType === "phraseFill" ? d.choosePhraseFill : d.choose;
  const listenHint = question.questionType === "phraseFill" ? d.listenPromptFill : d.listenPrompt;

  return (
    <main className="flex-1 px-4 py-6 sm:py-8">
      {/*
        Max-width expandido para acomodar o layout lado-a-lado.
        No mobile: coluna. No sm+: flex-row com proporção 5/7.
      */}
      <div className="mx-auto w-full max-w-4xl">

        {/* ── Topbar: back + shuffle ── */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onMouseEnter={playHover}
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors"
          >
            <ArrowLeft size={15} />
            {d.backToQuizzes}
          </button>
          <button
            onMouseEnter={playHover}
            onClick={onShuffle}
            disabled={shuffling || finishing}
            title={d.shuffle}
            aria-label={d.shuffle}
            className="flex h-8 w-8 items-center justify-center text-[var(--fg-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
          >
            <Shuffle size={16} className={shuffling ? "animate-spin" : ""} />
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between font-[family-name:var(--font-body)] text-xs text-[var(--fg-muted)]">
            <span>{d.title}</span>
            <span>{current + 1} / {quiz.questions.length}</span>
          </div>
          <div className="h-[3px] w-full bg-[var(--bg-secondary)]">
            <motion.div
              className="h-full bg-[var(--accent)]"
              animate={{ width: `${progress + (1 / quiz.questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* ── Main quiz area ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {/*
              LAYOUT PRINCIPAL:
              Mobile  → flex-col (prompt em cima, opções embaixo)
              sm+     → flex-row (prompt à esquerda 5fr, opções à direita 7fr)
              A borda envolve o conjunto inteiro para criar a "caixa editorial".
            */}
            <div
              className="flex flex-col sm:flex-row border-2 border-[var(--border)] bg-[var(--surface)]"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              {/* ── LEFT / TOP: Prompt ── */}
              <div className="
                flex flex-col justify-between
                p-5 sm:p-8
                border-b-2 sm:border-b-0 sm:border-r-2 border-[var(--border)]
                sm:w-1/2 shrink-0
              ">
                {/* Label de idioma */}
                <p className="font-[family-name:var(--font-body)] text-xs font-medium uppercase tracking-[0.12em] text-[var(--fg-muted)] mb-4">
                  {dict.dashboard.swissGerman}
                </p>

                {/* Conteúdo do prompt */}
                <div className="flex-1 flex flex-col items-start justify-center">
                  {promptMode === "audio" && question.audioUrl ? (
                    <div className="flex flex-col gap-3">
                      <WordAudioButton
                        audioUrl={question.audioUrl}
                        label={d.playAudio}
                        autoPlay
                        size="lg"
                      />
                      <p className="font-[family-name:var(--font-body)] text-sm text-[var(--fg-muted)]">
                        {listenHint}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 w-full">
                      <motion.p
                        key={question.prompt}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`font-extrabold text-[var(--fg)] break-words w-full ${
                          isPhrase
                            ? "text-lg sm:text-xl leading-snug font-[family-name:var(--font-body)]"
                            : "font-[family-name:var(--font-display)] tracking-tight leading-none"
                        }`}
                        style={
                          !isPhrase
                            ? { fontSize: "clamp(32px, 5vw, 68px)" }
                            : undefined
                        }
                      >
                        {isPhrase ? <PhrasePrompt text={question.prompt} /> : question.prompt}
                      </motion.p>
                      {question.audioUrl && promptMode !== "audio" && (
                        <div className="shrink-0 mt-1">
                          <WordAudioButton
                            audioUrl={question.audioUrl}
                            label={d.playAudio}
                            autoPlay={promptMode === "both"}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Category toggle — na base do painel esquerdo */}
                <div className="flex flex-col gap-2 items-start mt-5">
                  <button
                    onMouseEnter={playHover}
                    onClick={() => { onToggleCategory(); playClick(); }}
                    className="flex items-center gap-1.5 border-2 border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-xs font-bold font-[family-name:var(--font-body)] text-white hover:bg-transparent hover:text-[var(--accent)] transition-colors duration-100"
                  >
                    <Eye size={13} />
                    {showCategory ? d.hideCategory : d.showCategory}
                  </button>
                  <span
                    className={`inline-flex items-center border border-[var(--accent-muted)] bg-[var(--accent-muted)] px-2 py-0.5 font-[family-name:var(--font-body)] text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent)] ${showCategory ? "visible" : "invisible"}`}
                  >
                    {dict.categories?.[question.category] ?? question.category}
                  </span>
                </div>
              </div>

              {/* ── RIGHT / BOTTOM: Answers ── */}
              <div className="flex flex-col flex-1 min-w-0">
                {/* Instruction label */}
                <div className="px-5 py-3 border-b border-[var(--border)]">
                  <p className="font-[family-name:var(--font-body)] text-xs font-medium uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                    {instruction}
                  </p>
                </div>

                {/*
                  Opções: 2x2 grid no sm+, 1 coluna no mobile.
                  gap-[2px] para o efeito de grelha compacta do design system.
                */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2px] flex-1">
                  {question.options.map((opt, i) => {
                    const isSelected = question.selected === opt;
                    const isCorrectOption = isAnswered && question.correctAnswer === opt;

                    let style =
                      "border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--bg-secondary)] hover:border-[var(--fg)]";
                    if (isAnswered) {
                      if (isCorrectOption) {
                        style = "border-[var(--success)] bg-[var(--success-muted)] text-[var(--success)]";
                      } else if (isSelected) {
                        style = "border-[var(--error)] bg-[var(--surface)] text-[var(--fg-muted)] line-through opacity-70";
                      } else {
                        style = "border-[var(--border)] bg-[var(--surface)] text-[var(--fg-subtle)] opacity-40";
                      }
                    }

                    return (
                      <motion.button
                        key={`${opt}-${i}`}
                        onMouseEnter={() => !isAnswered && playHover()}
                        onClick={() => onSelect(opt)}
                        disabled={isAnswered || answering}
                        className={`flex items-center justify-between gap-3 border px-4 py-4 sm:py-0 sm:min-h-[72px] text-left text-sm font-[family-name:var(--font-body)] transition-colors duration-100 disabled:cursor-not-allowed ${style}`}
                      >
                        {/* Número da opção — A B C D */}
                        <span className="shrink-0 font-[family-name:var(--font-display)] font-bold text-[var(--fg-subtle)] text-xs mr-2">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isAnswered && isCorrectOption && (
                          <CheckCircle2 size={16} className="shrink-0" />
                        )}
                        {isAnswered && isSelected && !isCorrectOption && (
                          <XCircle size={16} className="shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* ── Feedback + Next (dentro do painel direito) ── */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t-2 border-[var(--border)] px-4 py-3"
                    >
                      <div
                        className={`flex items-center gap-2 font-[family-name:var(--font-body)] text-sm font-semibold ${
                          question.correct ? "text-[var(--success)]" : "text-[var(--error)]"
                        }`}
                      >
                        {question.correct ? (
                          <><CheckCircle2 size={15} /> {d.correct}</>
                        ) : (
                          <><XCircle size={15} /> {d.wrong} — {question.correctAnswer}</>
                        )}
                      </div>
                      <button
                        onMouseEnter={playHover}
                        onClick={onNext}
                        disabled={finishing}
                        className="flex items-center justify-center gap-2 border-2 border-[var(--accent)] bg-[var(--accent)] px-4 py-2 font-[family-name:var(--font-display)] text-sm font-bold text-white hover:bg-transparent hover:text-[var(--accent)] transition-colors duration-100 disabled:opacity-60 w-full sm:w-auto shrink-0"
                      >
                        {current < quiz.questions.length - 1 ? d.next : d.finish}
                        <ArrowRight size={15} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
