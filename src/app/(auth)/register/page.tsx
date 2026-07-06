"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Logo from "../../../components/ui/Logo";
import { auth, firebaseConfigError, isFirebaseConfigured } from "../../../lib/firebase";

function getReadableFirebaseError(code: string): string {
  const messageMap: Record<string, string> = {
    "auth/invalid-email": "Format email tidak valid.",
    "auth/email-already-in-use": "Email ini sudah terdaftar.",
    "auth/weak-password": "Password terlalu lemah (minimal 6 karakter).",
    "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi nanti.",
  };

  return messageMap[code] ?? "Registrasi gagal. Silakan coba lagi.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormInvalid = useMemo(() => {
    return (
      name.trim().length < 2 ||
      email.trim().length === 0 ||
      password.trim().length < 6
    );
  }, [name, email, password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!auth || !isFirebaseConfigured) {
      setErrorMessage(firebaseConfigError || "Firebase belum dikonfigurasi.");
      return;
    }

    if (isFormInvalid) {
      setErrorMessage("Nama minimal 2 karakter, email valid, dan password minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (credential.user && name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      router.push("/dashboard/service");
    } catch (error) {
      const firebaseError = error as { code?: string };
      setErrorMessage(getReadableFirebaseError(firebaseError.code ?? ""));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="container-app flex items-center justify-between py-6">
        <Link href="/" aria-label="Kembali ke beranda">
          <Logo />
        </Link>
        <Link href="/login" className="text-sm font-medium text-ink-muted hover:text-ink">
          Sudah punya akun? <span className="text-brand-700 underline">Login</span>
        </Link>
      </header>

      <main className="container-app grid place-items-center px-5 pb-20">
        <section className="w-full max-w-md animate-fade-in">
          <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-card sm:p-8">
            <h1 className="font-display text-2xl text-ink sm:text-3xl">Buat akun baru</h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              Cukup 30 detik. Mulai catat kendaraanmu segera.
            </p>

            {!isFirebaseConfigured ? (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                {firebaseConfigError}
              </p>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink" htmlFor="name">
                  Nama
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama lengkap"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-ink" htmlFor="password">
                    Password
                  </label>
                  <span className="text-xs text-ink-subtle">Minimal 6 karakter</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Buat password baru"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {errorMessage ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
              ) : null}

              <Button
                className="w-full"
                size="lg"
                type="submit"
                disabled={isSubmitting || isFormInvalid || !isFirebaseConfigured}
              >
                {isSubmitting ? "Memproses..." : "Buat Akun"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-muted">
              Sudah punya akun?{" "}
              <Link className="font-semibold text-brand-700 hover:underline" href="/login">
                Masuk di sini
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-ink-subtle">
            Data kamu disimpan aman di Firebase.
          </p>
        </section>
      </main>
    </div>
  );
}
