import { useEffect, useState } from "react";
import { SparklesIcon, StarBadgeIcon, UserIcon } from "./AppIcons";
import { avatarOptions } from "../data/avatars";
import { supabase } from "../lib/supabase";
import { formatNumber } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

export const PerksAdminPanel = () => {
  const { sendAdminEmail } = useAppContext();
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
    if (!supabase) return;
    const newStatus = !currentStatus;
    try {
      await supabase.from("profiles").update({ is_beta_tester: newStatus }).eq("id", userId);
      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, is_beta_tester: newStatus, isBetaTester: newStatus } : p)),
      );
      if (newStatus) {
        try {
          await sendAdminEmail({
            recipientIds: [userId],
            subject: "🏆 Official Neural Tester Status Granted - MindGrid",
            message: `Hello Operative,\n\nYou have officially been granted Neural Tester status on MindGrid: Neural Clash!\n\nLog in to your account at https://neuralclash.dev to claim your +1,000 Founder XP Boost, exclusive Neural Tester title badge, and glowing gold profile avatar ring.\n\nThank you for testing MindGrid!\n- MindGrid Founder Architect`,
          });
        } catch (emailErr) {
          console.warn("Email notify error:", emailErr);
        }
      }
      setStatusMsg(`Updated Neural Tester status to ${newStatus ? "ACTIVE" : "INACTIVE"} and sent email DM.`);
    } catch (err) {
      setErrorMsg("Failed to update tester status.");
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const selectAllTesters = () => {
    const testerIds = profiles.filter((p) => p.is_beta_tester || p.isBetaTester).map((p) => p.id);
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
        subject: "🎉 You Received Official MindGrid Founder Perks!",
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
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-700">
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-bold text-rose-700">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        {/* User Emails & Testers Table */}
        <section className="rounded-[1.6rem] border border-white/70 bg-white/84 p-5 shadow-[0_16px_36px_rgba(53,37,205,0.06)]">
          <div className="flex items-center justify-between border-b border-[#ececf6] pb-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1a2340]">Registered Accounts & Emails</h2>
              <p className="text-xs text-[#6c7489]">Inspect registered player emails and manage Neural Tester badges.</p>
            </div>
            <button
              type="button"
              onClick={selectAllTesters}
              className="rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
            >
              Select All Neural Testers
            </button>
          </div>

          <div className="max-h-[34rem] overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              <p className="py-8 text-center text-xs font-bold text-slate-500">Loading account directory...</p>
            ) : profiles.length ? (
              profiles.map((p) => {
                const avatar = avatarOptions.find((a) => a.id === p.avatar_id) ?? avatarOptions[0];
                const isSelected = selectedUserIds.includes(p.id);
                const isTester = Boolean(p.is_beta_tester || p.isBetaTester);

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                      isSelected ? "border-[#4f46e5] bg-[#eef2ff]" : "border-slate-200/80 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectUser(p.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[#4f46e5]"
                      />
                      <img src={avatar.image} alt="" className="h-10 w-10 rounded-full border border-slate-200" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">{p.username || "Agent"}</span>
                          {isTester && (
                            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-black text-amber-800 border border-amber-300">
                              Neural Tester
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-medium text-slate-600 truncate">{p.email || "No email address"}</div>
                        <div className="text-[11px] text-slate-400">
                          XP: {formatNumber(p.xp || 0)} • Joined: {new Date(p.created_at || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleNeuralTesterStatus(p.id, isTester)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                        isTester
                          ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
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
        <section className="rounded-[1.6rem] border border-white/70 bg-white/84 p-5 shadow-[0_16px_36px_rgba(53,37,205,0.06)]">
          <div className="border-b border-[#ececf6] pb-4 mb-4">
            <h2 className="text-lg font-bold text-[#1a2340]">Gift Perks & Founder Rewards</h2>
            <p className="text-xs text-[#6c7489]">Distribute active Perks with live APIs to selected players.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                Select Perks to Gift (Multi-Select Allowed):
              </label>
              <div className="space-y-2">
                <label
                  onClick={() => togglePerk("xp_1000")}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    selectedPerks.includes("xp_1000")
                      ? "border-[#4f46e5] bg-[#eef2ff]"
                      : "border-slate-200 bg-white hover:border-indigo-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPerks.includes("xp_1000")}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-[#4f46e5]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">+1,000 Founder XP Boost</p>
                    <p className="text-[11px] text-slate-500">Adds +1,000 XP directly to user account balance.</p>
                  </div>
                </label>

                <label
                  onClick={() => togglePerk("tester_badge")}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    selectedPerks.includes("tester_badge")
                      ? "border-[#4f46e5] bg-[#eef2ff]"
                      : "border-slate-200 bg-white hover:border-indigo-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPerks.includes("tester_badge")}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-[#4f46e5]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Neural Tester Title & Gold Avatar Ring</p>
                    <p className="text-[11px] text-slate-500">Grants Neural Tester badge & gold glowing avatar frame.</p>
                  </div>
                </label>

                <label
                  onClick={() => togglePerk("crystals_500")}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    selectedPerks.includes("crystals_500")
                      ? "border-[#4f46e5] bg-[#eef2ff]"
                      : "border-slate-200 bg-white hover:border-indigo-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPerks.includes("crystals_500")}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-[#4f46e5]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">+500 Neural Crystals Bonus</p>
                    <p className="text-[11px] text-slate-500">Credits 500 bonus score points balance.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100 text-xs text-indigo-900">
              <p><span className="font-bold">Selected Perks: </span>{selectedPerks.length} perk(s)</p>
              <p><span className="font-bold">Target Recipients: </span>{selectedUserIds.length} player(s)</p>
            </div>

            <button
              type="button"
              onClick={handleDistributePerk}
              disabled={processing || selectedUserIds.length === 0}
              className="w-full rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#3525cd] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:scale-[1.01] disabled:opacity-50"
            >
              {processing ? "Distributing Perks..." : "Gift Perks & Send Notification"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
