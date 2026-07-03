import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

type EventRequest = {
  prompt?: string;
  edition?: unknown;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const extractJson = (content: string) => {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced ?? content;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("The AI response did not contain a JSON object.");
  }
  return JSON.parse(raw.slice(start, end + 1));
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  const groqModel = Deno.env.get("GROQ_MODEL") ?? "llama-3.3-70b-versatile";

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Supabase function environment is missing project credentials." }, 500);
  }
  if (!groqApiKey) {
    return json({ error: "GROQ_API_KEY is not configured for this Supabase function." }, 500);
  }

  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token) {
    return json({ error: "Admin login is required." }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authorization },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return json({ error: "Admin login is required." }, 401);
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) return json({ error: adminError.message }, 500);
  if (!adminRow) return json({ error: "Admin access is required." }, 403);

  const payload = (await request.json()) as EventRequest;
  const prompt = payload.prompt?.trim() ?? "";
  if (!prompt) return json({ error: "Prompt is required." }, 400);

  const systemPrompt = `You are MindGrid's tournament config assistant.
Return only valid JSON. Do not use markdown.
You can only create content supported by the existing MindGrid event engine:
- public event metadata: title, slug, status
- rules: string[]
- categories: { title, paths: string[], beginnerNotes?: { term, meaning }[] }[]
- memory rounds: each round has id, number, title, subtitle, summary, pairs
- each pair has id, prompt, answer
- bonus challenges: id, title, prompt, body, expectedAnswer, points, hint
Do not claim you can add unsupported game systems, multiplayer, payments, uploads, custom engines, or new UI mechanics.
If the user asks for unsupported functionality, keep the event playable with supported content and list unsupported items in unsupportedRequests.
Slugs must use lowercase letters, numbers, and hyphens only.
Use 3 rounds by default, 8 pairs per round, and safe educational content.
The output shape must be:
{
  "edition": { "id": string, "slug": string, "title": string, "status": "draft"|"published"|"closed", "createdAt": string, "updatedAt": string, "config": { "heroLabel": string, "tagline": string, "description": string, "eventLabel": string, "rules": string[], "qualificationScore": number, "maxMemoryScore": number, "maxBonusScore": number, "categories": [], "rounds": [], "challenges": [] } },
  "notes": string[],
  "unsupportedRequests": string[]
}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: groqModel,
      temperature: 0.45,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            prompt,
            currentEdition: payload.edition,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    return json(
      {
        error: "Groq rejected the generation request.",
        details: await response.text(),
      },
      502,
    );
  }

  const completion = await response.json();
  const content = completion?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    return json({ error: "Groq did not return generated content." }, 502);
  }

  try {
    const parsed = extractJson(content);
    return json(parsed);
  } catch (error) {
    return json(
      {
        error: "Generated event could not be parsed.",
        details: error instanceof Error ? error.message : String(error),
      },
      502,
    );
  }
});
