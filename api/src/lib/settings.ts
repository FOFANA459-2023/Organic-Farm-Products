import type { Db } from "./supabase";
import type { Settings } from "@ofp/shared";
import { maybe, ApiError } from "./http";

export async function loadSettings(supabase: Db): Promise<Settings> {
  const row = maybe(await supabase.from("settings").select("data").eq("id", 1).maybeSingle());
  if (!row) throw new ApiError(500, "settings_missing", "Site settings have not been set up");
  return row.data as Settings;
}
