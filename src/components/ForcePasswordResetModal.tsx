import { useState } from "react";
import { authApi } from "../lib/auth";
import { useAppContext } from "../state/AppContext";

export const ForcePasswordResetModal = () => {
  const { session, updateProfileState } = useAppContext();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!session?.profile.mustChangePassword) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      await authApi.resetPassword(newPassword);
      // Update local profile state to clear mustChangePassword
      if (updateProfileState) {
        updateProfileState({ mustChangePassword: false });
      }
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to set new password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 dark:bg-slate-950/80">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-indigo-100 text-center dark:bg-slate-900 dark:border-slate-800">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[#3525cd]">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>

        <h2 className="font-display text-xl font-black text-[#1e1b4b] dark:text-white">
          Set New Password Required
        </h2>

        <p className="mt-2 text-xs leading-relaxed text-[#64748b] dark:text-slate-300">
          An administrator has reset your password and issued a temporary login. Please set your new permanent password below to continue using your MindGrid account.
        </p>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-slate-400">
              New Permanent Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-xs text-[#1e1b4b] focus:border-[#3525cd] focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-slate-400">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-xs text-[#1e1b4b] focus:border-[#3525cd] focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#3525cd] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {saving ? "Updating Password..." : "Set New Password & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};
