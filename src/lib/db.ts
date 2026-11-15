import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Untyped handle for tables added after the generated types were last refreshed. */
export const db = supabase as unknown as SupabaseClient;
