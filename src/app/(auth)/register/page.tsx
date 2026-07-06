"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import Logo from "../../../components/ui/Logo";
import { auth, firebaseConfigError, isFirebaseConfigured, googleProvider, facebookProvider } from "../../../lib/firebase";

function getReadableFirebaseError(code: string): string {
  const messageMap: Record<string, string> = {
    "auth/invalid-email": "Format email tidak valid.",
    "auth/email-already-in-use": "Email ini sudah terdaftar.",
    "auth/weak-password": "Password terlalu lemah (minimal 6 karakter).",
    "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi nanti.",
    "auth/popup-closed-by-user": "Popup login ditutup. Silakan coba lagi.",
    "auth/cancelled-popup-request": "Login dibatalkan.",
    "auth/account-exists-with-different-credential": "Akun sudah terdaftar dengan metode login lain.",
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
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFormInvalid = useMemo(() => {
    return (
      name.trim().length < 2 ||
      email.trim().length === 0 ||
      password.trim().length < 6
    );
  }, [name, email, password]);

  const emailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const nameValid = useMemo(() => {
    return name.trim().length >= 2;
  }, [name]);

  // Auto step progression
  useEffect(() => {
    if (nameValid && currentStep === 1) {
      setCurrentStep(2);
    }
    if (emailValid && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [nameValid, emailValid, currentStep]);

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
      router.push("/dashboard");
    } catch (error) {
      const firebaseError = error as { code?: string };
      setErrorMessage(getReadableFirebaseError(firebaseError.code ?? ""));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    if (!auth) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code !== "auth/popup-closed-by-user") {
        setErrorMessage(getReadableFirebaseError(firebaseError.code ?? ""));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFacebookLogin() {
    if (!auth) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, facebookProvider);
      router.push("/dashboard");
    } catch (error) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code !== "auth/popup-closed-by-user") {
        setErrorMessage(getReadableFirebaseError(firebaseError.code ?? ""));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-brand-50">
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-72 w-72 animate-pulse rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 animate-pulse rounded-full bg-brand-200/20 blur-3xl" style={{ animationDelay: "1s" }} />
        <div className="absolute right-1/3 top-1/2 h-64 w-64 animate-pulse rounded-full bg-amber-200/20 blur-3xl" style={{ animationDelay: "2s" }} />
      </div>

      {/* Left Panel - Register Form */}
      <div className="relative flex w-full flex-col lg:w-1/2">
        {/* Header */}
        <header className="flex items-center justify-between p-6 lg:p-8">
          <Link href="/" aria-label="Kembali ke beranda" className="transition-transform hover:scale-105">
            <Logo />
          </Link>
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-ink-muted shadow-soft backdrop-blur-sm transition-all hover:bg-white hover:text-ink hover:shadow-md"
          >
            <span>Sudah punya akun?</span>
            <span className="text-brand-700 transition-transform group-hover:translate-x-0.5">Masuk →</span>
          </Link>
        </header>

        {/* Form */}
        <main className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-12">
          <section className={`w-full max-w-md transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            {/* Welcome Text */}
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                Gratis selamanya
              </div>
              <h1 className="font-display text-3xl text-ink sm:text-4xl">Buat akun baru</h1>
              <p className="mt-2 text-ink-muted">Cukup 30 detik. Mulai catat kendaraanmu segera.</p>
            </div>

            {/* Progress Steps */}
            <div className="mb-6 flex items-center justify-center gap-2 lg:justify-start">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step
                        ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {currentStep > step ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div className={`h-0.5 w-8 rounded transition-colors duration-300 ${currentStep > step ? "bg-brand-500" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Register Card */}
            <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              {mounted && !isFirebaseConfigured ? (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-amber-200 text-amber-700">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 9v4M12 17h.01" />
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </svg>
                  </span>
                  <p className="text-sm text-amber-800">{firebaseConfigError}</p>
                </div>
              ) : null}

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                {/* Name Field */}
                <div className="group relative">
                  <label
                    htmlFor="name"
                    className={`pointer-events-none absolute left-4 z-10 transition-all duration-200 ${
                      focusedField === "name" || name
                        ? "-top-2.5 bg-white px-2 text-xs font-medium text-brand-600"
                        : "top-3.5 text-sm text-ink-muted"
                    }`}
                  >
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 pr-12 text-ink outline-none transition-all duration-200 ${
                        focusedField === "name"
                          ? "border-brand-500 shadow-lg shadow-brand-500/10"
                          : name && !nameValid
                          ? "border-red-300"
                          : name && nameValid
                          ? "border-emerald-300"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      required
                    />
                    {name && (
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all ${nameValid ? "text-emerald-500" : "text-red-400"}`}>
                        {nameValid ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m15 9-6 6M9 9l6 6" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                  {name && !nameValid && (
                    <p className="mt-1.5 text-xs text-amber-600">Minimal 2 karakter</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="group relative">
                  <label
                    htmlFor="email"
                    className={`pointer-events-none absolute left-4 z-10 transition-all duration-200 ${
                      focusedField === "email" || email
                        ? "-top-2.5 bg-white px-2 text-xs font-medium text-brand-600"
                        : "top-3.5 text-sm text-ink-muted"
                    }`}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 pr-12 text-ink outline-none transition-all duration-200 ${
                        focusedField === "email"
                          ? "border-brand-500 shadow-lg shadow-brand-500/10"
                          : email && !emailValid
                          ? "border-red-300"
                          : email && emailValid
                          ? "border-emerald-300"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      required
                    />
                    {email && (
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all ${emailValid ? "text-emerald-500" : "text-red-400"}`}>
                        {emailValid ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m15 9-6 6M9 9l6 6" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="group relative">
                  <label
                    htmlFor="password"
                    className={`pointer-events-none absolute left-4 z-10 transition-all duration-200 ${
                      focusedField === "password" || password
                        ? "-top-2.5 bg-white px-2 text-xs font-medium text-brand-600"
                        : "top-3.5 text-sm text-ink-muted"
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 pr-12 text-ink outline-none transition-all duration-200 ${
                        focusedField === "password"
                          ? "border-brand-500 shadow-lg shadow-brand-500/10"
                          : password.length >= 6
                          ? "border-emerald-300"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            password.length >= level * 3
                              ? password.length >= 12
                                ? "bg-emerald-500"
                                : password.length >= 8
                                ? "bg-brand-500"
                                : "bg-amber-500"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-ink-subtle">
                      Kekuatan password:{" "}
                      <span className={password.length >= 12 ? "text-emerald-600" : password.length >= 8 ? "text-brand-600" : password.length >= 6 ? "text-amber-600" : "text-red-500"}>
                        {password.length >= 12 ? "Sangat Kuat" : password.length >= 8 ? "Kuat" : password.length >= 6 ? "Sedang" : "Lemah"}
                      </span>
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 animate-shake">
                    <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </span>
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isFormInvalid || (mounted && !isFirebaseConfigured)}
                  className={`group relative w-full overflow-hidden rounded-xl py-4 font-semibold text-white transition-all duration-300 ${
                    isSubmitting || isFormInvalid || (mounted && !isFirebaseConfigured)
                      ? "cursor-not-allowed bg-slate-300"
                      : "bg-gradient-to-r from-emerald-600 to-brand-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98]"
                  }`}
                >
                  <span className={`flex items-center justify-center gap-2 transition-all ${isSubmitting ? "opacity-0" : "opacity-100"}`}>
                    Buat Akun Gratis
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                  {isSubmitting && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-ink-subtle">atau daftar dengan</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white py-3 text-sm font-medium text-ink transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white py-3 text-sm font-medium text-ink transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-ink-muted">
                Sudah punya akun?{" "}
                <Link className="font-semibold text-brand-700 underline-offset-4 hover:underline" href="/login">
                  Masuk di sini
                </Link>
              </p>
              <p className="mt-4 text-xs text-ink-subtle">
                Dengan mendaftar, kamu menyetujui{" "}
                <Link href="#" className="underline hover:text-ink-muted">Syarat & Ketentuan</Link>{" "}
                serta{" "}
                <Link href="#" className="underline hover:text-ink-muted">Kebijakan Privasi</Link>{" "}
                AjuLaju.
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* Right Panel - Illustration */}
      <div className="relative hidden w-1/2 items-center justify-center bg-gradient-to-br from-emerald-600 via-emerald-700 to-brand-700 p-12 lg:flex">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="circles" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#circles)" />
          </svg>
        </div>

        {/* Content */}
        <div className={`relative z-10 max-w-lg text-white transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          {/* Feature Cards */}
          <div className="relative mb-12 h-72">
            {/* Feature 1 */}
            <div className="absolute left-0 top-0 animate-float rounded-2xl bg-white/10 p-5 shadow-2xl backdrop-blur-sm" style={{ animationDelay: "0s" }}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-400/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">Data Aman</p>
                  <p className="text-sm opacity-80">Firebase Security</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="absolute right-0 top-20 animate-float rounded-2xl bg-white/10 p-5 shadow-2xl backdrop-blur-sm" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-400/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">Catat Mudah</p>
                  <p className="text-sm opacity-80">Input Cepat</p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="absolute bottom-0 left-8 animate-float rounded-2xl bg-white/10 p-5 shadow-2xl backdrop-blur-sm" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-400/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">Laporan Lengkap</p>
                  <p className="text-sm opacity-80">Statistik Visual</p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="font-display text-4xl leading-tight">
            Mulai perjalananmu<br />bersama<br /><span className="text-emerald-200">AjuLaju</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/80">
            Bergabung dengan ribuan pengguna yang sudah menikmati kemudahan mencatat pengeluaran kendaraan.
          </p>

          {/* Benefits */}
          <ul className="mt-8 space-y-3">
            {["Gratis selamanya, tanpa biaya tersembunyi", "Sinkronisasi otomatis di semua perangkat", "Laporan bulanan & reminder servis"].map((benefit, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/30">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span className="text-white/90">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
