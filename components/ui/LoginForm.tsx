"use client";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus("");

    try {
      if (!auth) {
        throw new Error("Firebase environment variables are missing. Update .env.local first.");
      }
      await signInWithEmailAndPassword(auth, email, password);
      setStatus("Logged in successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      onSubmit={onSubmit}
    >
      <h1 className="text-xl font-semibold">Login</h1>
      <input
        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        required
        type="email"
        value={email}
      />
      <input
        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        required
        type="password"
        value={password}
      />
      <button
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
      {status ? <p className="text-sm text-zinc-600">{status}</p> : null}
    </form>
  );
}
