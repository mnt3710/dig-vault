import { DigJudgePanel } from "@/components/dig/DigJudgePanel";

export default function DigPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900">Dig Mode</h1>
      <DigJudgePanel />
    </main>
  );
}
