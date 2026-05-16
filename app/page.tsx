import Link from "next/link";

const modes = [
  {
    href: "/dig",
    title: "Dig Mode",
    description: "Upload an image and get an instant thrift judgment.",
  },
  {
    href: "/closet",
    title: "Closet Mode",
    description: "Organize saved finds with Firebase-backed storage.",
  },
  {
    href: "/login",
    title: "Login",
    description: "Sign in with Firebase Authentication.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-zinc-500">Dig Vault</p>
        <h1 className="text-3xl font-bold text-zinc-900">
          Thrift store dig judgment + closet management
        </h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {modes.map((mode) => (
          <Link
            key={mode.href}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            href={mode.href}
          >
            <h2 className="text-lg font-semibold">{mode.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{mode.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
