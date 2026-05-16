import { StoreMap } from "@/components/ui/StoreMap";

export function ClosetOverview() {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Closet Mode</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Keep your best finds organized. Firebase Firestore and Storage are prepared in lib/firebase.ts for
        inventory sync and image storage.
      </p>
      <StoreMap />
    </section>
  );
}
