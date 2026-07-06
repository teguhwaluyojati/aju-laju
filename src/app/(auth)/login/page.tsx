"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup, sendEmailVerification } from "firebase/auth";
import Logo from "../../../components/ui/Logo";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import PolicyModalContent from "../../../components/ui/PolicyModalContent";
import { auth, firebaseConfigError, isFirebaseConfigured, googleProvider, facebookProvider } from "../../../lib/firebase";
import { useAuth } from "../../../hooks/useAuth";
import { useT } from "../../../hooks/useT";

export default function LoginPage() {
  const { t, locale } = useT();
  const router = useRouter();
    function localizePath(path: string): string {
      return path === "/" ? `/${locale}` : `/${locale}${path}`;
    }

    function getReadableFirebaseError(code: string): string {
      const messageMap: Record<string, string> = {
        "auth/invalid-email": t("Format email tidak valid.", "Invalid email format."),
        "auth/invalid-credential": t("Email atau password salah.", "Incorrect email or password."),
        "auth/operation-not-allowed": t(
          "Metode login Email/Password belum diaktifkan di Firebase Authentication.",
          "Email/Password sign-in is not enabled in Firebase Authentication."
        ),
        "auth/configuration-not-found": t(
          "Konfigurasi autentikasi Firebase belum ditemukan. Cek pengaturan Authentication.",
          "Firebase authentication configuration was not found. Please check Authentication settings."
        ),
        "auth/network-request-failed": t(
          "Koneksi internet bermasalah. Periksa jaringan lalu coba lagi.",
          "Network issue detected. Please check your connection and try again."
        ),
        "auth/user-disabled": t("Akun ini dinonaktifkan.", "This account has been disabled."),
        "auth/too-many-requests": t("Terlalu banyak percobaan login. Coba lagi nanti.", "Too many login attempts. Try again later."),
        "auth/popup-closed-by-user": t("Popup login ditutup. Silakan coba lagi.", "Login popup closed. Please try again."),
        "auth/cancelled-popup-request": t("Login dibatalkan.", "Login cancelled."),
        "auth/account-exists-with-different-credential": t("Akun sudah terdaftar dengan metode login lain.", "Account exists with a different sign-in method."),
      };

      return messageMap[code] ?? `${t("Login gagal. Silakan coba lagi.", "Login failed. Please try again.")} (${code || "unknown"})`;
    }

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<"terms" | "privacy" | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCooldown, setVerificationCooldown] = useState(0);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (verificationCooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setVerificationCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [verificationCooldown]);

  // Redirect if already logged in
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const hasPasswordProvider = user.providerData.some((provider) => provider.providerId === "password");
    if (!hasPasswordProvider || user.emailVerified) {
      router.replace(localizePath("/dashboard"));
    }
  }, [authLoading, isAuthenticated, router, locale, user]);

  const isFormInvalid = useMemo(() => {
    return email.trim().length === 0 || password.trim().length < 6;
  }, [email, password]);

  const emailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  // Show loading while checking auth, but do not block authenticated-unverified users.
  if (!mounted || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setNoticeMessage("");

    if (!auth || !isFirebaseConfigured) {
      setErrorMessage(firebaseConfigError || t("Firebase belum dikonfigurasi.", "Firebase is not configured."));
      return;
    }

    if (isFormInvalid) {
      setErrorMessage(t("Email dan password minimal 6 karakter wajib diisi.", "Email and password (min 6 characters) are required."));
      return;
    }

    if (!hasAcceptedPolicies) {
      setErrorMessage(
        t(
          "Centang persetujuan Syarat & Ketentuan serta Kebijakan Privasi terlebih dahulu.",
          "Please accept the Terms & Conditions and Privacy Policy first."
        )
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

      const hasPasswordProvider = credential.user.providerData.some(
        (provider) => provider.providerId === "password"
      );
      if (hasPasswordProvider && !credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        setPendingVerificationEmail(credential.user.email || email.trim());
        setShowVerificationModal(true);
        setVerificationCooldown(60);
        setNoticeMessage("");
        setPassword("");
        return;
      }

      router.push(localizePath("/dashboard"));
    } catch (error) {
      const firebaseError = error as { code?: string };
      setErrorMessage(getReadableFirebaseError(firebaseError.code ?? ""));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendVerificationEmail() {
    if (!auth?.currentUser || verificationCooldown > 0) return;

    setIsResending(true);
    setErrorMessage("");
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationCooldown(60);
      setNoticeMessage(
        t(
          "Email verifikasi berhasil dikirim ulang. Silakan cek inbox/spam.",
          "Verification email has been resent. Please check inbox/spam."
        )
      );
    } catch (error) {
      const firebaseError = error as { code?: string };
      setErrorMessage(getReadableFirebaseError(firebaseError.code ?? ""));
    } finally {
      setIsResending(false);
    }
  }

  async function handleVerifiedAndContinue() {
    if (!auth?.currentUser) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setShowVerificationModal(false);
        router.push(localizePath("/dashboard"));
        return;
      }

      setErrorMessage(
        t(
          "Email kamu belum terverifikasi. Cek inbox/spam lalu klik link aktivasi.",
          "Your email is not verified yet. Please check inbox/spam and click the verification link."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    if (!auth) return;
    setErrorMessage("");
    setNoticeMessage("");

    if (!hasAcceptedPolicies) {
      setErrorMessage(
        t(
          "Centang persetujuan Syarat & Ketentuan serta Kebijakan Privasi terlebih dahulu.",
          "Please accept the Terms & Conditions and Privacy Policy first."
        )
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push(localizePath("/dashboard"));
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
    setNoticeMessage("");

    if (!hasAcceptedPolicies) {
      setErrorMessage(
        t(
          "Centang persetujuan Syarat & Ketentuan serta Kebijakan Privasi terlebih dahulu.",
          "Please accept the Terms & Conditions and Privacy Policy first."
        )
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, facebookProvider);
      router.push(localizePath("/dashboard"));
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
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-brand-50">
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 animate-pulse rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-emerald-200/20 blur-3xl" style={{ animationDelay: "1s" }} />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 animate-pulse rounded-full bg-amber-200/20 blur-3xl" style={{ animationDelay: "2s" }} />
      </div>

      {/* Left Panel - Illustration */}
      <div className="relative hidden w-1/2 items-center justify-center bg-gradient-to-br from-brand-600 via-brand-700 to-emerald-700 p-12 lg:flex">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className={`relative z-10 max-w-lg text-white transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          {/* Floating Cards Animation */}
          <div className="relative mb-12 h-64">
            {/* Card 1 - Service */}
            <div className="absolute left-0 top-0 animate-float rounded-2xl bg-white/10 p-5 shadow-2xl backdrop-blur-sm" style={{ animationDelay: "0s" }}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-400/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3-.6-.6Z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium opacity-80">{t("Ganti Oli", "Oil Change")}</p>
                  <p className="text-lg font-bold">Rp 125.000</p>
                </div>
              </div>
            </div>

            {/* Card 2 - Fuel */}
            <div className="absolute right-0 top-16 animate-float rounded-2xl bg-white/10 p-5 shadow-2xl backdrop-blur-sm" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-400/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M4 20h11M15 10h3l2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium opacity-80">Pertalite</p>
                  <p className="text-lg font-bold">5.2 Liter</p>
                </div>
              </div>
            </div>

            {/* Card 3 - Stats */}
            <div className="absolute bottom-0 left-8 animate-float rounded-2xl bg-white/10 p-5 shadow-2xl backdrop-blur-sm" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-400/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium opacity-80">{t("Total Bulan Ini", "Total This Month")}</p>
                  <p className="text-lg font-bold">Rp 850.000</p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="font-display text-4xl leading-tight">
            {t("Kelola pengeluaran", "Manage your")}<br />{t("kendaraanmu dengan", "vehicle expenses in a")}<br /><span className="text-brand-200">{t("mudah & rapi", "clean and easy way")}</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/80">
            {t("Catat servis, bensin, dan pantau semua pengeluaran kendaraanmu dalam satu aplikasi yang simpel.", "Log service, fuel, and track all vehicle expenses in one simple app.")}
          </p>

          {/* Stats */}
          <div className="mt-10 flex gap-8">
            <div>
              <p className="font-display text-3xl font-bold">2.5K+</p>
              <p className="text-sm text-white/70">{t("Pengguna Aktif", "Active Users")}</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold">50K+</p>
              <p className="text-sm text-white/70">{t("Catatan Dibuat", "Records Created")}</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold">4.9</p>
              <p className="text-sm text-white/70">Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="relative flex w-full flex-col lg:w-1/2">
        {/* Header */}
        <header className="flex items-center justify-between p-6 lg:p-8">
          <Link href={localizePath("/")} aria-label={t("Kembali ke beranda", "Back to home")} className="transition-transform hover:scale-105">
            <Logo />
          </Link>
          <Link
            href={localizePath("/register")}
            className="group flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-ink-muted shadow-soft backdrop-blur-sm transition-all hover:bg-white hover:text-ink hover:shadow-md"
          >
            <span>{t("Belum punya akun?", "No account yet?")}</span>
            <span className="text-brand-700 transition-transform group-hover:translate-x-0.5">{t("Daftar", "Sign up")} →</span>
          </Link>
        </header>

        {/* Form */}
        <main className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-12">
          <section className={`w-full max-w-md transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            {/* Welcome Text */}
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500"></span>
                {t("Selamat datang kembali", "Welcome back")}
              </div>
              <h1 className="font-display text-3xl text-ink sm:text-4xl">{t("Masuk ke akun", "Sign in to your account")}</h1>
              <p className="mt-2 text-ink-muted">{t("Lanjutkan pencatatan kendaraanmu yang terakhir.", "Continue where you left off.")}</p>
            </div>

            {/* Login Card */}
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
                    {t("Password", "Password")}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
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
                  {password && password.length < 6 && (
                    <p className="mt-1.5 text-xs text-amber-600">{t("Minimal 6 karakter", "Minimum 6 characters")}</p>
                  )}
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
                      {t("Kekuatan password", "Password strength")}:{" "}
                      <span className={password.length >= 12 ? "text-emerald-600" : password.length >= 8 ? "text-brand-600" : password.length >= 6 ? "text-amber-600" : "text-red-500"}>
                        {password.length >= 12 ? t("Sangat Kuat", "Very Strong") : password.length >= 8 ? t("Kuat", "Strong") : password.length >= 6 ? t("Sedang", "Medium") : t("Lemah", "Weak")}
                      </span>
                    </p>
                  </div>
                )}

                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={hasAcceptedPolicies}
                    onChange={(event) => {
                      setHasAcceptedPolicies(event.target.checked);
                      if (event.target.checked) {
                        setErrorMessage("");
                      }
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>
                    {t("Saya sudah membaca dan menyetujui", "I have read and agree to")}{" "}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setActivePolicyModal("terms");
                      }}
                      className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                    >
                      {t("Syarat & Ketentuan", "Terms & Conditions")}
                    </button>{" "}
                    {t("serta", "and")}{" "}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setActivePolicyModal("privacy");
                      }}
                      className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                    >
                      {t("Kebijakan Privasi", "Privacy Policy")}
                    </button>
                    .
                  </span>
                </label>

                {/* Error Message */}
                {noticeMessage && (
                  <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
                    <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <p className="text-sm text-emerald-800">{noticeMessage}</p>
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isFormInvalid || !hasAcceptedPolicies || (mounted && !isFirebaseConfigured)}
                  className={`group relative w-full overflow-hidden rounded-xl py-4 font-semibold text-white transition-all duration-300 ${
                    isSubmitting || isFormInvalid || !hasAcceptedPolicies || (mounted && !isFirebaseConfigured)
                      ? "cursor-not-allowed bg-slate-300"
                      : "bg-gradient-to-r from-brand-600 to-brand-700 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.98]"
                  }`}
                >
                  <span className={`flex items-center justify-center gap-2 transition-all ${isSubmitting ? "opacity-0" : "opacity-100"}`}>
                    {t("Masuk", "Sign In")}
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
                <span className="text-xs font-medium text-ink-subtle">{t("atau masuk dengan", "or continue with")}</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting || !hasAcceptedPolicies}
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
                  disabled={isSubmitting || !hasAcceptedPolicies}
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
                {t("Belum punya akun?", "No account yet?")} {" "}
                <Link className="font-semibold text-brand-700 underline-offset-4 hover:underline" href={localizePath("/register")}>
                  {t("Daftar gratis", "Sign up for free")}
                </Link>
              </p>
              <p className="mt-4 text-xs text-ink-subtle">
                {t("Dengan masuk, kamu menyetujui", "By signing in, you agree to")}{" "}
                <button type="button" onClick={() => setActivePolicyModal("terms")} className="underline hover:text-ink-muted">{t("Syarat & Ketentuan", "Terms & Conditions")}</button>{" "}
                {t("serta", "and")}{" "}
                <button type="button" onClick={() => setActivePolicyModal("privacy")} className="underline hover:text-ink-muted">{t("Kebijakan Privasi", "Privacy Policy")}</button>{" "}
                AjuLaju.
              </p>
            </div>
          </section>
        </main>
      </div>

      <Modal
        open={activePolicyModal !== null}
        title={
          activePolicyModal === "terms"
            ? t("Syarat & Ketentuan", "Terms & Conditions")
            : t("Kebijakan Privasi", "Privacy Policy")
        }
        onClose={() => setActivePolicyModal(null)}
      >
        {activePolicyModal ? (
          <PolicyModalContent locale={locale} type={activePolicyModal} />
        ) : null}
      </Modal>

      <Modal
        open={showVerificationModal}
        title={t("Verifikasi Email Diperlukan", "Email Verification Required")}
        onClose={() => setShowVerificationModal(false)}
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-muted">
            {t(
              "Akun kamu belum terverifikasi. Kami sudah mengirim link aktivasi ke email berikut:",
              "Your account is not verified yet. We have sent an activation link to:"
            )}
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-ink">{pendingVerificationEmail || user?.email || email || "-"}</p>
          <p className="text-xs text-ink-subtle">
            {t(
              "Cek inbox/spam, klik link verifikasi, lalu lanjutkan login.",
              "Check inbox/spam, click the verification link, then continue login."
            )}
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleResendVerificationEmail}
              disabled={isResending || verificationCooldown > 0}
            >
              {isResending
                ? t("Mengirim Ulang...", "Resending...")
                : verificationCooldown > 0
                ? t(`Kirim Ulang (${verificationCooldown}d)`, `Resend (${verificationCooldown}s)`)
                : t("Kirim Ulang Email", "Resend Email")}
            </Button>
            <Button type="button" onClick={handleVerifiedAndContinue} disabled={isSubmitting}>
              {isSubmitting ? t("Memeriksa...", "Checking...") : t("Saya Sudah Verifikasi", "I Have Verified")}
            </Button>
          </div>
        </div>
      </Modal>

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
