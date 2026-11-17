import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";

// Invite-only beta: only admins and approved waitlist emails can use the app.
// This is the display gate; the edge functions enforce it with has_app_access.

export type AccessState = "loading" | "signed_out" | "pending" | "allowed";

export function useAppAccess(): AccessState {
  const [state, setState] = useState<AccessState>("loading");

  useEffect(() => {
    let cancelled = false;
    const check = async (signedIn: boolean) => {
      if (!signedIn) {
        if (!cancelled) setState("signed_out");
        return;
      }
      const { data, error } = await db.rpc("my_app_access");
      if (!cancelled) setState(!error && data === true ? "allowed" : "pending");
    };

    supabase.auth.getSession().then(({ data }) => check(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      check(!!session);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
