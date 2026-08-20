import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import nodemailer from "npm:nodemailer@6.9.16";

type EmailRequest = {
  recipientIds?: string[];
  subject?: string;
  message?: string;
  html?: string;
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

const linkify = (escapedText: string) => {
  return escapedText.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" style="color:#1c05b3;font-weight:700;text-decoration:underline;">$1</a>',
  );
};

export const renderEmail = (subject: string, message: string) => {
  const paragraphs = escapeHtml(message)
    .split(/\n{2,}/)
    .map((paragraph) => {
      const formatted = linkify(paragraph.replaceAll("\n", "<br />"));
      return `<p style="margin:0 0 14px;color:#334155;line-height:1.75;font-size:14px;">${formatted}</p>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#f8faff;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 16px 40px rgba(28,5,179,0.06);">
      
      <!-- Brand Header with Floating Trypan Blue Logo -->
      <tr>
        <td style="padding:36px 24px 20px;text-align:center;background:radial-gradient(circle at top,#eff1ff 0%,#ffffff 75%);border-bottom:1px solid #f1f5f9;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
            <tr>
              <td style="background:#1c05b3;border-radius:18px;padding:12px;text-align:center;box-shadow:0 10px 24px rgba(28,5,179,0.32);">
                <img src="https://neuralclash.dev/logo-m.png" alt="MindGrid" width="40" height="40" style="display:block;margin:0 auto;border:none;" />
              </td>
            </tr>
          </table>
          <h1 style="margin:14px 0 2px;font-size:22px;font-weight:900;color:#1c05b3;letter-spacing:-0.02em;line-height:1.2;">MindGrid</h1>
          <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;">NEURAL CLASH &middot; KLYVEX STUDIOS</p>
        </td>
      </tr>

      <!-- Subject & Main Message Content -->
      <tr>
        <td style="padding:28px 28px 12px;">
          <div style="background:#f8faff;border:1px solid #e2e8f0;border-radius:20px;padding:24px 22px;">
            <h2 style="margin:0 0 16px;color:#0f172a;font-size:17px;font-weight:800;line-height:1.4;border-bottom:1px solid #e2e8f0;padding-bottom:12px;">
              ${escapeHtml(subject)}
            </h2>
            <div>
              ${paragraphs}
            </div>
          </div>
        </td>
      </tr>

      <!-- Quick Action Button -->
      <tr>
        <td style="padding:8px 28px 24px;text-align:center;">
          <a href="https://neuralclash.dev/?install=pwa" target="_blank" style="display:inline-block;background:linear-gradient(180deg,#2406e2 0%,#1c05b3 100%);color:#ffffff;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;border-radius:999px;padding:14px 32px;box-shadow:0 12px 24px rgba(28,5,179,0.25);">
            Launch MindGrid &rarr;
          </a>
        </td>
      </tr>

      <!-- Footer Security & Studio Attribution -->
      <tr>
        <td style="padding:20px 24px 28px;border-top:1px solid #f1f5f9;text-align:center;color:#94a3b8;font-size:11px;line-height:1.6;">
          <p style="margin:0 0 4px;">Dispatched from secure admin gateway &middot; <a href="https://neuralclash.dev" style="color:#1c05b3;text-decoration:none;font-weight:600;">https://neuralclash.dev</a></p>
          <p style="margin:0;">Built by <strong>Klyvex Studios</strong> &middot; <a href="https://klyvex-studios.tech" style="color:#64748b;text-decoration:none;">https://klyvex-studios.tech</a></p>
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

  const htmlContent = payload.html || renderEmail(subject, message);

  try {
    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipients.map((recipient) => `"${recipient.name}" <${recipient.email}>`).join(", "),
      subject,
      html: htmlContent,
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
