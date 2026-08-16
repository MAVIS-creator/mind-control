import type { PlayerProfile } from "../types";
import { supabase } from "./supabase";

export type Friendship = {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  friendProfile?: PlayerProfile;
};

// Local in-memory fallback for offline/dev testing
const localFriendships = new Map<string, Friendship>();

export const fetchSuggestedPlayers = async (
  currentUserId: string,
  query = "",
  page = 0,
  pageSize = 12,
): Promise<{ players: PlayerProfile[]; hasMore: boolean }> => {
  if (supabase) {
    let req = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .neq("id", currentUserId);

    if (query.trim()) {
      req = req.ilike("username", `%${query.trim()}%`);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, count, error } = await req.order("xp", { ascending: false }).range(from, to);

    if (!error && data) {
      const players: PlayerProfile[] = data.map((p) => ({
        id: p.id,
        username: p.username || "Agent",
        email: p.email || "",
        avatarId: p.avatar_id || "cyber_grid",
        xp: p.xp || 0,
        rank: p.rank || "Neural Rookie",
        createdAt: p.created_at || new Date().toISOString(),
        isAdmin: Boolean(p.is_admin),
      }));

      const hasMore = (count ?? 0) > from + players.length;
      return { players, hasMore };
    }
  }

  return { players: [], hasMore: false };
};

export const searchPlayersByUsername = async (
  query: string,
  currentUserId: string,
): Promise<PlayerProfile[]> => {
  const result = await fetchSuggestedPlayers(currentUserId, query, 0, 20);
  return result.players;
};

export const sendFriendRequest = async (
  requester: PlayerProfile,
  addressee: PlayerProfile,
): Promise<Friendship> => {
  if (supabase) {
    const { data, error } = await supabase
      .from("friendships")
      .insert({
        requester_id: requester.id,
        addressee_id: addressee.id,
        status: "pending",
      })
      .select("*")
      .single();

    if (error && !error.message.includes("duplicate")) {
      throw new Error(error.message || "Failed to send friend request.");
    }

    // Trigger email notification to recipient
    if (addressee.email && addressee.email.includes("@")) {
      try {
        await sendFriendRequestEmail(requester.username, addressee.email, addressee.username);
      } catch (err) {
        console.warn("Could not dispatch email notification:", err);
      }
    }

    if (data) {
      return {
        id: data.id,
        requesterId: data.requester_id,
        addresseeId: data.addressee_id,
        status: data.status,
        createdAt: data.created_at,
        friendProfile: addressee,
      };
    }
  }

  // Fallback to local store
  const friendshipId = `friendship-${Date.now()}`;
  const f: Friendship = {
    id: friendshipId,
    requesterId: requester.id,
    addresseeId: addressee.id,
    status: "pending",
    createdAt: new Date().toISOString(),
    friendProfile: addressee,
  };
  localFriendships.set(friendshipId, f);
  return f;
};

export const sendFriendRequestEmail = async (
  senderUsername: string,
  recipientEmail: string,
  recipientUsername: string,
): Promise<void> => {
  if (!supabase) return;

  const subject = `New Friend Request from ${senderUsername} on MindGrid!`;
  const message = `Hi ${recipientUsername},\n\nOperative ${senderUsername} has sent you a friend request on MindGrid Neural Clash!\n\nLog in to your MindGrid account to accept their request and challenge them in real-time multiplayer duels.`;

  try {
    await supabase.functions.invoke("admin-send-email", {
      body: {
        recipientIds: [],
        customEmail: recipientEmail,
        subject,
        message,
      },
    });
  } catch (err) {
    console.error("Failed to invoke email notification function", err);
  }
};

export const fetchUserFriendships = async (userId: string): Promise<{
  friends: Friendship[];
  pendingReceived: Friendship[];
  pendingSent: Friendship[];
}> => {
  if (supabase) {
    const { data, error } = await supabase
      .from("friendships")
      .select(`
        *,
        requester:profiles!friendships_requester_id_fkey(*),
        addressee:profiles!friendships_addressee_id_fkey(*)
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (!error && data) {
      const friends: Friendship[] = [];
      const pendingReceived: Friendship[] = [];
      const pendingSent: Friendship[] = [];

      data.forEach((row) => {
        const isRequester = row.requester_id === userId;
        const otherRaw = isRequester ? row.addressee : row.requester;
        const otherProfile: PlayerProfile = {
          id: otherRaw.id,
          username: otherRaw.username || "Agent",
          email: otherRaw.email || "",
          avatarId: otherRaw.avatar_id || "cyber_grid",
          xp: otherRaw.xp || 0,
          rank: otherRaw.rank || "Neural Rookie",
          createdAt: otherRaw.created_at || new Date().toISOString(),
          isAdmin: Boolean(otherRaw.is_admin),
        };

        const f: Friendship = {
          id: row.id,
          requesterId: row.requester_id,
          addresseeId: row.addressee_id,
          status: row.status,
          createdAt: row.created_at,
          friendProfile: otherProfile,
        };

        if (row.status === "accepted") {
          friends.push(f);
        } else if (row.status === "pending") {
          if (isRequester) pendingSent.push(f);
          else pendingReceived.push(f);
        }
      });

      return { friends, pendingReceived, pendingSent };
    }
  }

  const all = Array.from(localFriendships.values()).filter(
    (f) => f.requesterId === userId || f.addresseeId === userId,
  );
  return {
    friends: all.filter((f) => f.status === "accepted"),
    pendingReceived: all.filter((f) => f.addresseeId === userId && f.status === "pending"),
    pendingSent: all.filter((f) => f.requesterId === userId && f.status === "pending"),
  };
};

export const updateFriendshipStatus = async (
  friendshipId: string,
  status: "accepted" | "rejected",
): Promise<void> => {
  if (supabase) {
    if (status === "rejected") {
      await supabase.from("friendships").delete().eq("id", friendshipId);
    } else {
      await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
    }
  }

  const local = localFriendships.get(friendshipId);
  if (local) {
    if (status === "rejected") localFriendships.delete(friendshipId);
    else local.status = "accepted";
  }
};
