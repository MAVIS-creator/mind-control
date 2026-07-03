import type { AuthSession } from "../types";
import { hasSupabase, supabase } from "./supabase";
import type { EventEdition } from "./eventEditions";

export type EventAiDraft = {
  edition: EventEdition;
  notes: string[];
  unsupportedRequests: string[];
};

export const generateEventEditionWithAi = async ({
  session,
  prompt,
  edition,
}: {
  session: AuthSession;
  prompt: string;
  edition: EventEdition;
}): Promise<EventAiDraft> => {
  if (!session.profile.isAdmin) throw new Error("Admin access is required.");
  if (!prompt.trim()) throw new Error("Describe the tournament you want to create.");
  if (!hasSupabase || !supabase) {
    throw new Error("AI tournament generation needs Supabase Edge Functions and your GROQ_API_KEY secret.");
  }

  const { data, error } = await supabase.functions.invoke("admin-generate-event", {
    headers: session.accessToken
      ? {
          Authorization: `Bearer ${session.accessToken}`,
        }
      : undefined,
    body: {
      prompt,
      edition,
    },
  });

  if (error) {
    let details = "";
    const maybeContext = (error as { context?: unknown }).context;
    if (maybeContext instanceof Response) {
      try {
        const body = (await maybeContext.clone().json()) as { error?: string; details?: string };
        details = [body.error, body.details].filter(Boolean).join(" ");
      } catch {
        details = await maybeContext.clone().text().catch(() => "");
      }
    }
    throw new Error(details || error.message || "Unable to generate event draft.");
  }

  return data as EventAiDraft;
};
