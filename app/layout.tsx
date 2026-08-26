import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "SwissLearn — Learn Swiss German",
    template: "%s | SwissLearn",
  },
  description: "Master Swiss German through interactive quizzes, real vocabulary, and spaced repetition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
