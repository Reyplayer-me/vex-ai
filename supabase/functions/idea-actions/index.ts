// Ownership-sensitive actions on ideas. Anonymous visitors prove ownership with
// the claim token returned by quick-verdict; signed-in users with their JWT.
//   remember_email  - anon: remember which email may claim this idea after a magic link
//   claim           - signed in: attach anonymous ideas (by token or verified email)
//   share / unshare - opt-in public summary at /r/:shareId
//   delete_my_data  - signed in: delete the account and everything owned by it
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, fail, getUser, json, randomToken, serviceClient, sha256 } from "../_shared/vex.ts";

const UUID = /^[0-9a-f-]{36}$/i;
const MAX_IMAGE_BYTES = 1_500_000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail("invalid_input");
  }

  const db = serviceClient();
  const user = await getUser(req);
  const action = body?.action;

  // Loads an idea the caller owns, by JWT or claim token.
  async function ownedIdea(id: unknown, token: unknown) {
    if (typeof id !== "string" || !UUID.test(id)) return null;
    const { data } = await db.from("ideas").select("id, user_id, claim_token_hash, share_id").eq("id", id).maybeSingle();
    if (!data) return null;
    if (user && data.user_id === user.id) return data;
    if (!data.user_id && typeof token === "string" && token.length > 10 && data.claim_token_hash === (await sha256(token))) {
      return data;
    }
    return null;
  }

  try {
    switch (action) {
      case "remember_email": {
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 255) {
          return fail("invalid_input", "Enter a valid email address.");
        }
        const idea = await ownedIdea(body.id, body.token);
        if (!idea || idea.user_id) return fail("not_found");
        await db.from("ideas").update({ claim_email: email }).eq("id", idea.id);
        return json({ ok: true });
      }

      case "claim": {
        if (!user) return fail("unauthorized");
        const claimed: string[] = [];
        const pairs = Array.isArray(body.items) ? body.items.slice(0, 20) : [];
        for (const pair of pairs) {
          const idea = await ownedIdea(pair?.id, pair?.token);
          if (idea && !idea.user_id) {
            await db.from("ideas").update({ user_id: user.id, claim_token_hash: null, claim_email: null }).eq("id", idea.id).is("user_id", null);
            claimed.push(idea.id);
          }
        }
        // Magic links can open in a different browser, so also claim by verified email.
        if (user.email && user.email_confirmed_at) {
          const { data } = await db
            .from("ideas")
            .update({ user_id: user.id, claim_token_hash: null, claim_email: null })
            .is("user_id", null)
            .eq("claim_email", user.email.toLowerCase())
            .select("id");
          for (const row of data ?? []) claimed.push(row.id);
        }
        return json({ claimed });
      }

      case "share": {
        const idea = await ownedIdea(body.id, body.token);
        if (!idea) return fail("not_found");
        const shareId = idea.share_id ?? randomToken(8);
        let imageUrl: string | null = null;
        if (typeof body.image === "string" && body.image.startsWith("data:image/png;base64,")) {
          const bytes = Uint8Array.from(atob(body.image.slice(22)), (c) => c.charCodeAt(0));
          if (bytes.length <= MAX_IMAGE_BYTES) {
            const path = `${shareId}.png`;
            const { error } = await db.storage.from("share-images").upload(path, bytes, { contentType: "image/png", upsert: true });
            if (error) console.error("idea-actions: image upload failed", error.message);
            else imageUrl = db.storage.from("share-images").getPublicUrl(path).data.publicUrl;
          }
        }
        await db
          .from("ideas")
          .update({ share_id: shareId, shared_at: new Date().toISOString(), ...(imageUrl ? { share_image_url: imageUrl } : {}) })
          .eq("id", idea.id);
        return json({ shareId });
      }

      case "unshare": {
        const idea = await ownedIdea(body.id, body.token);
        if (!idea) return fail("not_found");
        if (idea.share_id) await db.storage.from("share-images").remove([`${idea.share_id}.png`]);
        await db.from("ideas").update({ share_id: null, shared_at: null, share_image_url: null }).eq("id", idea.id);
        return json({ ok: true });
      }

      case "delete_my_data": {
        if (!user) return fail("unauthorized");
        const { data: shared } = await db.from("ideas").select("share_id").eq("user_id", user.id).not("share_id", "is", null);
        const paths = (shared ?? []).map((r) => `${r.share_id}.png`);
        if (paths.length) await db.storage.from("share-images").remove(paths);
        // Older tables have no foreign key to auth.users, so clear them explicitly.
        await db.from("boardroom_messages").delete().eq("user_id", user.id);
        await db.from("validation_sessions").delete().eq("user_id", user.id);
        await db.from("ideas").delete().eq("user_id", user.id);
        const { error } = await db.auth.admin.deleteUser(user.id);
        if (error) throw new Error(`deleteUser: ${error.message}`);
        return json({ ok: true });
      }

      default:
        return fail("invalid_input");
    }
  } catch (err) {
    console.error("idea-actions failed", { action, detail: err instanceof Error ? err.message : String(err) });
    return fail("internal");
  }
});
