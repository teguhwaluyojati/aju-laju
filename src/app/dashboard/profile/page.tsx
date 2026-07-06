"use client";

import { useState } from "react";
import { updateProfile } from "firebase/auth";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useAuth } from "../../../hooks/useAuth";
import { auth } from "../../../lib/firebase";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSaveProfile() {
    if (!auth?.currentUser) return;
    setSaving(true);
    setSuccessMessage("");
    
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim() || null,
      });
      setSuccessMessage("Profil berhasil diperbarui!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  }

  const createdAt = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  const lastSignIn = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Profil Saya</h1>
        <p className="mt-1 text-sm text-ink-muted">Kelola informasi akun kamu.</p>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-soft">
        {/* Profile Header */}
        <div className="flex flex-wrap items-center gap-6">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="h-24 w-24 rounded-full border-4 border-brand-100 object-cover shadow-soft"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="grid h-24 w-24 place-items-center rounded-full bg-brand-100 text-brand-700 font-bold text-3xl shadow-soft">
              {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex-1">
            <h2 className="font-display text-xl text-ink">
              {user?.displayName || user?.email?.split("@")[0] || "Pengguna"}
            </h2>
            <p className="text-sm text-ink-muted">{user?.email}</p>
            <p className="mt-2 text-xs text-ink-subtle">
              Member sejak {createdAt}
            </p>
          </div>
          {!isEditing && (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              Edit Profil
            </Button>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="mt-6 border-t border-surface-border pt-6">
            <div className="max-w-md space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink" htmlFor="displayName">
                  Nama Tampilan
                </label>
                <Input
                  id="displayName"
                  placeholder="Masukkan nama kamu"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink">
                  Email
                </label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-slate-50 cursor-not-allowed"
                />
                <p className="text-xs text-ink-subtle">Email tidak dapat diubah.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user?.displayName || "");
                  }}
                  disabled={saving}
                >
                  Batal
                </Button>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-soft">
        <h3 className="font-display text-lg text-ink">Informasi Akun</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">User ID</p>
            <p className="mt-1 text-sm font-mono text-ink-muted">{user?.uid || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Metode Login</p>
            <p className="mt-1 text-sm text-ink-muted">
              {user?.providerData?.[0]?.providerId === "google.com"
                ? "Google"
                : user?.providerData?.[0]?.providerId === "facebook.com"
                ? "Facebook"
                : "Email/Password"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Terdaftar Sejak</p>
            <p className="mt-1 text-sm text-ink-muted">{createdAt}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Login Terakhir</p>
            <p className="mt-1 text-sm text-ink-muted">{lastSignIn}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
