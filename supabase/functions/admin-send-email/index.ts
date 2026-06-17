import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import nodemailer from "npm:nodemailer@6.9.16";

type EmailRequest = {
  recipientIds?: string[];
  subject?: string;
  message?: string;
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

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderEmail = (message: string) => {
  const paragraphs = escapeHtml(message)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replaceAll("\n", "<br />"))
    .map((paragraph) => `<p style="margin:0 0 16px;color:#4b5568;line-height:1.7;font-size:16px;">${paragraph}</p>`)
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#eef4ff;padding:32px;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #dfe7fb;">
      <tr>
        <td style="padding:28px 28px 10px;">
          <div style="display:inline-block;background:#4f46e5;color:#ffffff;border-radius:16px;padding:10px 13px;font-weight:800;letter-spacing:.08em;">MG</div>
          <h1 style="margin:18px 0 8px;color:#111827;font-size:28px;line-height:1.15;">MindGrid Admin Message</h1>
          <p style="margin:0;color:#64748b;font-size:14px;">A message from the MindGrid team.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 28px 10px;">
          ${paragraphs}
        </td>
      </tr>
      <tr>
        <td style="padding:22px 28px 28px;border-top:1px solid #edf2ff;color:#8a93a8;font-size:13px;">
          Built by Klyvex Studios for MindGrid.
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = Number(Deno.env.get("SMTP_PORT") ?? "587");
  const smtpUsername = Deno.env.get("SMTP_USERNAME");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");
  const fromEmail = Deno.env.get("SMTP_FROM_EMAIL") ?? smtpUsername;
  const fromName = Deno.env.get("SMTP_FROM_NAME") ?? "MindGrid";

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Supabase function environment is missing project credentials." }, 500);
  }
  if (!smtpHost || !smtpUsername || !smtpPassword || !fromEmail) {
    return json({ error: "Email sending is not configured. Add SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, and SMTP_FROM_EMAIL secrets." }, 500);
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

  if (adminError) {
    return json({ error: adminError.message }, 500);
  }
  if (!adminRow) {
    return json({ error: "Admin access is required." }, 403);
  }

  const payload = (await request.json()) as EmailRequest;
  const recipientIds = Array.from(new Set(payload.recipientIds ?? [])).filter(Boolean);
  const subject = payload.subject?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (!recipientIds.length) {
    return json({ error: "Choose at least one player." }, 400);
  }
  if (!subject || !message) {
    return json({ error: "Subject and message are required." }, 400);
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, email")
    .in("id", recipientIds);

  if (profilesError) {
    return json({ error: profilesError.message }, 500);
  }

  const recipients = (profiles ?? [])
    .filter((profile) => typeof profile.email === "string" && profile.email.includes("@"))
    .map((profile) => ({
      email: profile.email,
      name: profile.username,
    }));

  if (!recipients.length) {
    return json({ error: "Selected players do not have valid registered emails." }, 400);
  }

  const transport = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUsername,
      pass: smtpPassword,
    },
  });

  try {
    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipients.map((recipient) => `"${recipient.name}" <${recipient.email}>`).join(", "),
      subject,
      html: renderEmail(message),
      text: message,
    });
  } catch (error) {
    return json({
      error: "SMTP rejected the email request.",
      details: error instanceof Error ? error.message : String(error),
    }, 502);
  }

  return json({
    sent: recipients.length,
    recipients: recipients.map((recipient) => recipient.email),
  });
});
