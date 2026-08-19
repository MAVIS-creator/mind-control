import { useEffect, useState } from "react";
import { SparklesIcon, StarBadgeIcon, UserIcon } from "./AppIcons";
import { avatarOptions } from "../data/avatars";
import { isBetaTesterUser } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { formatNumber } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

export const PerksAdminPanel = () => {
  const { sendAdminEmail, triggerTestCooldown } = useAppContext();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedPerks, setSelectedPerks] = useState<string[]>(["xp_1000", "tester_badge"]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchAllProfiles = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setProfiles(data);
      }
    } catch (err) {
      console.warn("Fetch profiles error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProfiles();
  }, []);

  const toggleNeuralTesterStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      if (supabase) {
        const { error } = await supabase.from("profiles").update({ is_beta_tester: newStatus }).eq("id", userId);
        if (error) throw error;
      }

      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, is_beta_tester: newStatus, isBetaTester: newStatus } : p)),
      );

      // Also sync with localStorage if in offline/demo mode or local session
      if (typeof window !== "undefined") {
        try {
          const rawUsers = window.localStorage.getItem("mindgrid.users");
          if (rawUsers) {
            const parsed = JSON.parse(rawUsers);
            const updated = parsed.map((u: any) =>
              u.profile?.id === userId
                ? { ...u, profile: { ...u.profile, is_beta_tester: newStatus, isBetaTester: newStatus } }
                : u,
            );
            window.localStorage.setItem("mindgrid.users", JSON.stringify(updated));
          }
          const rawSession = window.localStorage.getItem("mindgrid.player_session");
          if (rawSession) {
            const parsedSession = JSON.parse(rawSession);
            if (parsedSession?.profile?.id === userId) {
              parsedSession.profile.is_beta_tester = newStatus;
              parsedSession.profile.isBetaTester = newStatus;
              window.localStorage.setItem("mindgrid.player_session", JSON.stringify(parsedSession));
            }
          }
        } catch {
          // ignore storage error
        }
      }

      if (newStatus) {
        try {
          await sendAdminEmail({
            recipientIds: [userId],
            subject: "Official Neural Tester Status Granted - MindGrid",
            message: `Hello Operative,\n\nYou have officially been granted Neural Tester status on MindGrid: Neural Clash!\n\nLog in to your account at https://neuralclash.dev to claim your +1,000 Founder XP Boost, exclusive Neural Tester title, and glowing gold profile avatar ring.\n\nThank you for testing MindGrid!\n- MindGrid Founder Architect`,
          });
        } catch (emailErr) {
          console.warn("Email notify error:", emailErr);
        }
      }
      setStatusMsg(`Updated Neural Tester status to ${newStatus ? "ACTIVE" : "REVOKED"} for this operative.`);
    } catch (err) {
      setErrorMsg("Failed to update tester status.");
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const selectAllTesters = () => {
    const testerIds = profiles
      .filter((p) => isBetaTesterUser(p.username, p.is_beta_tester ?? p.isBetaTester, p.created_at))
      .map((p) => p.id);
    setSelectedUserIds(testerIds);
  };

  const togglePerk = (perkId: string) => {
    setSelectedPerks((prev) =>
      prev.includes(perkId) ? prev.filter((p) => p !== perkId) : [...prev, perkId],
    );
  };

  const handleDistributePerk = async () => {
    if (!selectedUserIds.length) {
      setErrorMsg("Select at least one player to receive perks.");
      return;
    }

    if (!selectedPerks.length) {
      setErrorMsg("Select at least one perk to gift.");
      return;
    }

    setProcessing(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const awardedTitles: string[] = [];
      if (selectedPerks.includes("xp_1000")) awardedTitles.push("+1,000 Founder XP Boost");
      if (selectedPerks.includes("tester_badge")) awardedTitles.push("Neural Tester Title & Gold Avatar Ring");
      if (selectedPerks.includes("crystals_500")) awardedTitles.push("+500 Neural Crystals Bonus");

      for (const userId of selectedUserIds) {
        const target = profiles.find((p) => p.id === userId);
        if (!target) continue;

        let updates: any = {};
        let currentXp = target.xp || 0;

        if (selectedPerks.includes("xp_1000")) {
          currentXp += 1000;
        }
        if (selectedPerks.includes("crystals_500")) {
          currentXp += 500;
        }
        updates.xp = currentXp;

        if (selectedPerks.includes("tester_badge")) {
          updates.is_beta_tester = true;
        }

        if (supabase && Object.keys(updates).length) {
          await supabase.from("profiles").update(updates).eq("id", userId);
        }
      }

      await sendAdminEmail({
        recipientIds: selectedUserIds,
        subject: "You Received Official MindGrid Founder Perks!",
        message: `Hello Operative,\n\nYou have been awarded the following Founder Perks from the MindGrid Admin Team:\n\n• ${awardedTitles.join("\n• ")}\n\nLog in to your account at https://neuralclash.dev to view your updated perks, badge, and level!\n\nThank you for being part of MindGrid: Neural Clash!`,
      });

      setStatusMsg(`Successfully distributed ${selectedPerks.length} perk(s) to ${selectedUserIds.length} player(s) and sent email DMs.`);
      fetchAllProfiles();
    } catch (err) {
      setErrorMsg("Error distributing perks.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-bold text-rose-700 dark:text-rose-400">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        {/* User Emails & Testers Table */}
        <section className="rounded-[1.6rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 p-5 shadow-[0_16px_36px_rgba(37,99,235,0.06)]">
          <div className="flex items-center justify-between border-b border-[#ececf6] dark:border-slate-800 pb-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Registered Accounts & Emails</h2>
              <p className="text-xs text-[#64748b] dark:text-slate-400">Inspect registered player emails and manage Neural Tester badges.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={triggerTestCooldown}
                className="rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
              >
                Preview Rest Break Modal
              </button>
              <button
                type="button"
                onClick={selectAllTesters}
                className="rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
              >
                Select All Neural Testers
              </button>
            </div>
          </div>

          <div className="max-h-[34rem] overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              <p className="py-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400">Loading account directory...</p>
            ) : profiles.length ? (
              profiles.map((p) => {
                const avatar = avatarOptions.find((a) => a.id === p.avatar_id) ?? avatarOptions[0];
                const isSelected = selectedUserIds.includes(p.id);
                const isTester = isBetaTesterUser(p.username, p.is_beta_tester ?? p.isBetaTester, p.created_at);

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                      isSelected ? "border-[#2563eb] bg-[#eff6ff] dark:bg-blue-900/30" : "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectUser(p.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[#2563eb]"
                      />
                      <img src={avatar.image} alt="" className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white truncate">{p.username || "Agent"}</span>
                          {isTester && (
                            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
                              Neural Tester
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{p.email || "No email address"}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          XP: {formatNumber(p.xp || 0)} • Joined: {new Date(p.created_at || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleNeuralTesterStatus(p.id, isTester)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                        isTester
                          ? "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-500/30 dark:hover:bg-amber-900/50"
                      }`}
                    >
                      {isTester ? "Revoke Tester" : "Grant Tester"}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-center text-xs text-slate-500">No registered accounts found.</p>
            )}
          </div>
        </section>

        {/* Gift Perks Control Panel */}
        <section className="rounded-[1.6rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 p-5 shadow-[0_16px_36px_rgba(37,99,235,0.06)]">
          <div className="border-b border-[#ececf6] dark:border-slate-800 pb-4 mb-4">
            <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Gift Perks & Founder Rewards</h2>
            <p className="text-xs text-[#64748b] dark:text-slate-400">Distribute active Perks with live APIs to selected players.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
                Select Perks to Gift (Multi-Select Allowed):
              </label>
              <div className="space-y-2">
                <label
                  onClick={() => togglePerk("xp_1000")}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    selectedPerks.includes("xp_1000")
                      ? "border-[#2563eb] bg-[#eff6ff] dark:bg-blue-900/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-[#60a5fa] dark:hover:border-blue-500/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPerks.includes("xp_1000")}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-[#2563eb]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">+1,000 Founder XP Boost</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Adds +1,000 XP directly to user account balance.</p>
                  </div>
                </label>

                <label
                  onClick={() => togglePerk("tester_badge")}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    selectedPerks.includes("tester_badge")
                      ? "border-[#2563eb] bg-[#eff6ff] dark:bg-blue-900/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-[#60a5fa] dark:hover:border-blue-500/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPerks.includes("tester_badge")}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-[#2563eb]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Neural Tester Title & Gold Avatar Ring</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Grants Neural Tester badge & gold glowing avatar frame.</p>
                  </div>
                </label>

                <label
                  onClick={() => togglePerk("crystals_500")}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    selectedPerks.includes("crystals_500")
                      ? "border-[#2563eb] bg-[#eff6ff] dark:bg-blue-900/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-[#60a5fa] dark:hover:border-blue-500/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPerks.includes("crystals_500")}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-[#2563eb]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">+500 Neural Crystals Bonus</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Credits 500 bonus score points balance.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-sky-200">
              <p><span className="font-bold">Selected Perks: </span>{selectedPerks.length} perk(s)</p>
              <p><span className="font-bold">Target Recipients: </span>{selectedUserIds.length} player(s)</p>
            </div>

            <button
              type="button"
              onClick={handleDistributePerk}
              disabled={processing || selectedUserIds.length === 0}
              className="w-full rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:scale-[1.01] disabled:opacity-50"
            >
              {processing ? "Distributing Perks..." : "Gift Perks & Send Notification"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
