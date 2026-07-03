import { defaultEventChallenges } from "../data/defaultEventChallenges";
import { defaultEventCategories } from "../data/defaultEventPaths";
import { DEFAULT_EVENT_ID, DEFAULT_EVENT_LABEL, defaultEventRounds } from "../data/defaultEventRounds";
import type { EventChallenge } from "../data/defaultEventChallenges";
import type { EventCategory } from "../data/defaultEventPaths";
import type { EventRound } from "../data/defaultEventRounds";
import type { AuthSession } from "../types";
import { hasSupabase, supabase } from "./supabase";
import { normalizeUsername } from "./utils";

const EDITIONS_KEY = "mindgrid.eventEditions";
const RESERVED_SLUGS = new Set([
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "complete-email",
  "play",
  "results",
  "ranks",
  "contact",
  "hall-of-fame",
  "profile",
  "mavisbk",
]);

export type EventEditionStatus = "draft" | "published" | "closed";

export type EventEditionConfig = {
  heroLabel: string;
  tagline: string;
  description: string;
  eventLabel: string;
  rules: string[];
  qualificationScore: number;
  maxMemoryScore: number;
  maxBonusScore: number;
  categories: EventCategory[];
  rounds: EventRound[];
  challenges: EventChallenge[];
};

export type EventEdition = {
  id: string;
  slug: string;
  title: string;
  status: EventEditionStatus;
  config: EventEditionConfig;
  createdAt: string;
  updatedAt: string;
};

export const defaultEventEdition: EventEdition = {
  id: DEFAULT_EVENT_ID,
  slug: "cyberpath",
  title: "MindGrid: Neural Clash - CyberPath Edition",
  status: "published",
  createdAt: new Date("2026-07-03T00:00:00.000Z").toISOString(),
  updatedAt: new Date("2026-07-03T00:00:00.000Z").toISOString(),
  config: {
    heroLabel: "MindGrid: Neural Clash",
    tagline: "Learn. Match. Defend.",
    description:
      "Explore cybersecurity career paths through three fast memory rounds and safe bonus challenges.",
    eventLabel: DEFAULT_EVENT_LABEL,
    rules: [
      "Enter a nickname to join the event.",
      "Complete three 4 x 4 memory rounds.",
      "Score at least 2,400 memory points to unlock the bonus round.",
      "The live board shows nicknames only.",
    ],
    qualificationScore: 2400,
    maxMemoryScore: 3300,
    maxBonusScore: 300,
    categories: defaultEventCategories,
    rounds: defaultEventRounds,
    challenges: defaultEventChallenges,
  },
};

const safeStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export const normalizeEventSlug = (slug: string) =>
  normalizeUsername(slug.replace(/-/g, "_")).replace(/_/g, "-").slice(0, 48);

export const isReservedEventSlug = (slug: string) => RESERVED_SLUGS.has(slug);

const parseEditionRow = (row: any): EventEdition => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  status: row.status,
  config: row.config,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const loadLocalEventEditions = (): EventEdition[] => {
  const raw = safeStorage()?.getItem(EDITIONS_KEY);
  const editions = raw ? (JSON.parse(raw) as EventEdition[]) : [];
  const hasDefaultEdition = editions.some((edition) => edition.slug === defaultEventEdition.slug);
  return hasDefaultEdition ? editions : [defaultEventEdition, ...editions];
};

const saveLocalEventEditions = (editions: EventEdition[]) => {
  safeStorage()?.setItem(EDITIONS_KEY, JSON.stringify(editions));
};

export const fetchEventEdition = async (slug: string) => {
  const normalizedSlug = normalizeEventSlug(slug);
  if (!normalizedSlug) return null;

  if (hasSupabase && supabase) {
    const { data, error } = await supabase
      .from("event_editions")
      .select("*")
      .eq("slug", normalizedSlug)
      .in("status", ["published", "closed"])
      .maybeSingle();

    if (!error && data) return parseEditionRow(data);
  }

  return loadLocalEventEditions().find((edition) => edition.slug === normalizedSlug) ?? null;
};

export const fetchAdminEventEditions = async () => {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase
      .from("event_editions")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error && data) {
      const rows = data.map(parseEditionRow);
      return rows.some((edition) => edition.slug === defaultEventEdition.slug) ? rows : [defaultEventEdition, ...rows];
    }
  }

  return loadLocalEventEditions();
};

export const saveEventEdition = async (session: AuthSession, edition: EventEdition) => {
  if (!session.profile.isAdmin) throw new Error("Admin access is required.");
  const slug = normalizeEventSlug(edition.slug);
  if (!slug || slug.length < 3) throw new Error("Route slug must be at least 3 characters.");
  if (isReservedEventSlug(slug)) throw new Error("That route is reserved by the app.");

  const nextEdition: EventEdition = {
    ...edition,
    slug,
    updatedAt: new Date().toISOString(),
  };

  const local = loadLocalEventEditions().filter((item) => item.id !== nextEdition.id && item.slug !== slug);
  saveLocalEventEditions([nextEdition, ...local]);

  if (hasSupabase && supabase) {
    const { error } = await supabase.from("event_editions").upsert({
      id: nextEdition.id,
      slug: nextEdition.slug,
      title: nextEdition.title,
      status: nextEdition.status,
      config: nextEdition.config,
      created_at: nextEdition.createdAt,
      updated_at: nextEdition.updatedAt,
    });
    if (error) throw error;
  }

  return nextEdition;
};

export const createEventEditionDraft = (slug: string): EventEdition => {
  const now = new Date().toISOString();
  const normalizedSlug = normalizeEventSlug(slug || "new-event");
  return {
    ...defaultEventEdition,
    id: crypto.randomUUID(),
    slug: normalizedSlug,
    title: "New MindGrid Event Edition",
    status: "draft",
    createdAt: now,
    updatedAt: now,
    config: {
      ...defaultEventEdition.config,
      eventLabel: "One-Time MindGrid Event",
    },
  };
};
