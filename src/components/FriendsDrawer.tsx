import { useEffect, useState } from "react";
import { fetchUserFriendships, searchPlayersByUsername, sendFriendRequest, updateFriendshipStatus, type Friendship } from "../lib/friends";
import { supabase } from "../lib/supabase";
import { useAppContext } from "../state/AppContext";
import type { PlayerProfile } from "../types";

export type OnlinePresence = {
  userId: string;
  username: string;
  avatarId: string;
  onlineAt: string;
};

const formatLastSeen = (isoDate?: string | null): string => {
  if (!isoDate) return "Offline";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  if (isNaN(diffMs) || diffMs < 0) return "Offline";
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `Last seen ${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Last seen yesterday";
  return `Last seen ${diffDays}d ago`;
};

export const FriendsDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { session } = useAppContext();
  const profile = session?.profile;

  const [activeTab, setActiveTab] = useState<"friends" | "search" | "pending">("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlayerProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [friendsList, setFriendsList] = useState<Friendship[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friendship[]>([]);
  const [pendingSent, setPendingSent] = useState<Friendship[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const [onlineUsersMap, setOnlineUsersMap] = useState<Record<string, OnlinePresence>>({});

  // Global Presence Channel for Online Players
  useEffect(() => {
    if (!supabase || !profile) return;

    const globalChannel = supabase.channel("global_presence", {
      config: { presence: { key: profile.id } },
    });

    globalChannel
      .on("presence", { event: "sync" }, () => {
        const state = globalChannel.presenceState();
        const mapped: Record<string, OnlinePresence> = {};
        Object.keys(state).forEach((key) => {
          const pres = state[key]?.[0] as any;
          if (pres) {
            mapped[key] = {
              userId: key,
              username: pres.username || "Agent",
              avatarId: pres.avatarId || "cyber_grid",
              onlineAt: pres.onlineAt || new Date().toISOString(),
            };
          }
        });
        setOnlineUsersMap(mapped);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          globalChannel.track({
            username: profile.username,
            avatarId: profile.avatarId,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [profile]);

  // Load Friendships
  const loadFriendships = async () => {
    if (!profile) return;
    try {
      const data = await fetchUserFriendships(profile.id);
      setFriendsList(data.friends);
      setPendingReceived(data.pendingReceived);
      setPendingSent(data.pendingSent);
    } catch (err) {
      console.error("Failed to load friendships", err);
    }
  };

  useEffect(() => {
    if (isOpen && profile) {
      loadFriendships();
    }
  }, [isOpen, profile]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !profile) return;
    setIsSearching(true);
    try {
      const results = await searchPlayersByUsername(searchQuery, profile.id);
      setSearchResults(results);
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (targetProfile: PlayerProfile) => {
    if (!profile) return;
    setSendingId(targetProfile.id);
    try {
      await sendFriendRequest(profile, targetProfile);
      await loadFriendships();
      alert(`Friend request & email notification sent to ${targetProfile.username}!`);
    } catch (err: any) {
      alert(err.message || "Could not send friend request.");
    } finally {
      setSendingId(null);
    }
  };

  const handleRespondRequest = async (friendshipId: string, status: "accepted" | "rejected") => {
    try {
      await updateFriendshipStatus(friendshipId, status);
      await loadFriendships();
    } catch (err) {
      console.error("Error updating request", err);
    }
  };

  if (!isOpen) return null;

  const totalOnlineCount = Object.keys(onlineUsersMap).length || 1;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[#1e1b4b]">Operative Network</h2>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{totalOnlineCount} Players Online Now</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "friends"
                ? "border-b-2 border-[#3525cd] text-[#3525cd]"
                : "text-[#64748b] hover:text-[#1e1b4b]"
            }`}
          >
            Friends ({friendsList.length})
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "search"
                ? "border-b-2 border-[#3525cd] text-[#3525cd]"
                : "text-[#64748b] hover:text-[#1e1b4b]"
            }`}
          >
            Add Friend
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "pending"
                ? "border-b-2 border-[#3525cd] text-[#3525cd]"
                : "text-[#64748b] hover:text-[#1e1b4b]"
            }`}
          >
            Requests
            {pendingReceived.length > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
                {pendingReceived.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {/* Tab 1: Friends List */}
          {activeTab === "friends" && (
            <div className="space-y-3">
              {friendsList.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#64748b]">
                  No friends added yet. Use the "Add Friend" tab to search and connect!
                </p>
              ) : (
                friendsList.map((f) => {
                  const onlinePres = f.friendProfile?.id ? onlineUsersMap[f.friendProfile.id] : null;
                  const isOnline = Boolean(onlinePres);
                  const lastSeenTime = onlinePres?.onlineAt || f.friendProfile?.lastSeenAt;

                  return (
                    <div
                      key={f.id}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#3525cd] to-[#7c3aed] p-0.5">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-white font-bold text-[#1e1b4b]">
                              {f.friendProfile?.username.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                              isOnline ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1e1b4b]">{f.friendProfile?.username}</p>
                          <p className="text-[10px] text-[#64748b]">
                            {isOnline ? "Online Now" : formatLastSeen(lastSeenTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Search Players */}
          {activeTab === "search" && (
            <div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search player username..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#1e1b4b] focus:border-[#3525cd] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="rounded-xl bg-[#3525cd] px-4 py-2 text-xs font-bold text-white hover:bg-[#281ca8]"
                >
                  Search
                </button>
              </form>

              <div className="mt-4 space-y-3">
                {searchResults.map((user) => {
                  const isAlreadyFriend = friendsList.some((f) => f.friendProfile?.id === user.id);
                  const isPending =
                    pendingSent.some((f) => f.addresseeId === user.id) ||
                    pendingReceived.some((f) => f.requesterId === user.id);

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-100"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#1e1b4b]">{user.username}</p>
                        <p className="text-[10px] text-[#64748b]">{user.rank}</p>
                      </div>

                      {isAlreadyFriend ? (
                        <span className="text-[11px] font-semibold text-emerald-600">✓ Friend</span>
                      ) : isPending ? (
                        <span className="text-[11px] font-semibold text-amber-600">Pending</span>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(user)}
                          disabled={sendingId === user.id}
                          className="rounded-xl bg-[#4f46e5] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#3730a3]"
                        >
                          {sendingId === user.id ? "Sending..." : "Add & Notify Email"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Pending Requests */}
          {activeTab === "pending" && (
            <div className="space-y-3">
              {pendingReceived.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#64748b]">No incoming friend requests.</p>
              ) : (
                pendingReceived.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-100"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1e1b4b]">{req.friendProfile?.username}</p>
                      <p className="text-[10px] text-[#64748b]">Sent you a request</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespondRequest(req.id, "accepted")}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req.id, "rejected")}
                        className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
