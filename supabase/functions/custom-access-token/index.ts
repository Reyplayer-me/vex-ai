import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com"];

serve(async (req) => {
  const payload = await req.json();

  const email = payload?.record?.email || payload?.user?.email;

  if (!email) {
    return new Response(
      JSON.stringify({ error: "No email found in request" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
    // Return an error to block signup for disallowed domains
    return new Response(
      JSON.stringify({
        error: {
          http_code: 422,
          message: `Sign-ups are restricted to ${ALLOWED_DOMAINS.join(", ")} email addresses.`,
        },
      }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  // Allow the signup to proceed
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
