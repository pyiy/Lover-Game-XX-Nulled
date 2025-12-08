"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ThemeRecord = {
  id: string;
  title: string;
  description: string | null;
  task_count: number;
  created_at: string;
};

type TaskRecord = {
  id: string;
  theme_id: string;
  description: string;
  type: string;
  order_index: number;
  is_ai_generated: boolean;
  created_at: string;
};

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("未登录，无法执行该操作");
  }
  return { supabase, userId: data.user.id } as const;
}

export async function listMyThemes(): Promise<{ data: ThemeRecord[]; error?: string }> {
  const { supabase, userId } = await requireUser();
  const { data, error } = await supabase
    .from("themes")
    .select("id,title,description,task_count,created_at")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as ThemeRecord[] };
}

export async function getThemeById(id: string): Promise<{ data: ThemeRecord | null; error?: string }> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("themes")
    .select("id,title,description,task_count,created_at")
    .eq("id", id)
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as ThemeRecord };
}

export async function createTheme(formData: FormData): Promise<void> {
  const { supabase, userId } = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) throw new Error("主题标题为必填");

  const { data, error } = await supabase
    .from("themes")
    .insert({ title, description: description || null, creator_id: userId, is_public: false })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/themes");
  redirect(`/themes/${data.id}`);
}

export async function updateTheme(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!id) throw new Error("缺少主题 ID");
  if (!title) throw new Error("主题标题为必填");

  const { error } = await supabase
    .from("themes")
    .update({ title, description: description || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/themes");
  revalidatePath(`/themes/${id}`);
}

export async function deleteTheme(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("缺少主题 ID");

  const { error } = await supabase.from("themes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/themes");
}

export async function listTasksByTheme(themeId: string): Promise<{ data: TaskRecord[]; error?: string }> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("tasks")
    .select("id,theme_id,description,type,order_index,is_ai_generated,created_at")
    .eq("theme_id", themeId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as TaskRecord[] };
}

async function syncThemeTaskCount(supabase: Awaited<ReturnType<typeof createClient>>, themeId: string) {
  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("theme_id", themeId);
  if (typeof count === "number") {
    await supabase.from("themes").update({ task_count: count }).eq("id", themeId);
  }
}

export async function createTask(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const themeId = String(formData.get("theme_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "interaction");
  const orderIndexRaw = String(formData.get("order_index") ?? "");
  const order_index = Number.isFinite(Number(orderIndexRaw)) ? Number(orderIndexRaw) : 0;

  if (!themeId) throw new Error("缺少主题 ID");
  if (!description) throw new Error("任务内容为必填");

  const { error } = await supabase
    .from("tasks")
    .insert({ theme_id: themeId, description, type, order_index, is_ai_generated: false });
  if (error) throw new Error(error.message);

  await syncThemeTaskCount(supabase, themeId);
  revalidatePath(`/themes/${themeId}`);
}

export async function updateTask(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "interaction");
  const orderIndexRaw = String(formData.get("order_index") ?? "");
  const order_index = Number.isFinite(Number(orderIndexRaw)) ? Number(orderIndexRaw) : undefined;

  if (!id) throw new Error("缺少任务 ID");
  if (!description) throw new Error("任务内容为必填");

  const payload: Partial<Pick<TaskRecord, "description" | "type" | "order_index" >> = {
    description,
    type,
  };
  if (order_index !== undefined) payload.order_index = order_index;

  const { error } = await supabase.from("tasks").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteTask(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const themeId = String(formData.get("theme_id") ?? "");
  if (!id) throw new Error("缺少任务 ID");
  if (!themeId) throw new Error("缺少主题 ID");

  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await syncThemeTaskCount(supabase, themeId);
  revalidatePath(`/themes/${themeId}`);
}

export async function bulkInsertTasks(themeId: string, tasks: Array<{ description: string; type?: string; order_index?: number; is_ai_generated?: boolean }>): Promise<{ error?: string }> {
  const { supabase } = await requireUser();
  if (!themeId) return { error: "缺少主题 ID" };
  const rows = tasks.map(t => ({
    theme_id: themeId,
    description: t.description,
    type: t.type ?? "interaction",
    order_index: typeof t.order_index === "number" ? t.order_index : 0,
    is_ai_generated: t.is_ai_generated ?? true,
  }));

  const { error } = await supabase.from("tasks").insert(rows);
  if (error) return { error: error.message };
  await syncThemeTaskCount(supabase, themeId);
  revalidatePath(`/themes/${themeId}`);
  return {};
}