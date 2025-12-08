import { generateNickname } from "./nickname";
import { createClient } from "./supabase/server";

export async function ensureProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id, nickname")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) return;

  if (!existing) {
    const nickname = generateNickname(user.id);
    await supabase.from("profiles").insert({ id: user.id, nickname }).single();
    return;
  }

  if (!existing.nickname) {
    const nickname = generateNickname(user.id);
    await supabase
      .from("profiles")
      .update({ nickname })
      .eq("id", user.id)
      .single();
  }
}