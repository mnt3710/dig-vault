import { ClosetOverview } from "@/components/closet/ClosetOverview";

export default function ClosetPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900">Closet Mode</h1>
      <ClosetOverview />
    </main>
  );
}
