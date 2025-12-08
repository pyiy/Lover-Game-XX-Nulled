"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, X, CheckCircle2 } from "lucide-react";
import { bulkInsertTasks } from "@/app/themes/actions";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Suggestion = { description: string; type?: string; order_index?: number };

export default function GenerateTasksSection({ themeId, themeTitle, themeDescription, inline = false }: { themeId: string; themeTitle: string; themeDescription?: string | null; inline?: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [customRequirement, setCustomRequirement] = useState("");
  const [preferences, setPreferences] = useState<{ gender?: string; kinks?: string[] }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("preferences")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.preferences) {
          setPreferences(profile.preferences as any);
        }
      }
    };
    fetchPreferences();
    setMounted(true);
  }, []);

  const openModal = () => {
    setShowModal(true);
    setError(null);
    setSuggestions([]);
    setSelected({});
  };

  const closeModal = () => {
    setShowModal(false);
    setCustomRequirement("");
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: themeTitle,
          description: themeDescription ?? "",
          preferences,
          customRequirement,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "生成失败");
      setSuggestions(json.tasks || []);
      const initialSelection = Object.fromEntries((json.tasks || []).map((_: any, i: number) => [i, true]));
      setSelected(initialSelection);
    } catch (e: any) {
      setError(e?.message || "生成失败");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (idx: number) => {
    setSelected((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const selectAll = () => {
    setSelected(Object.fromEntries(suggestions.map((_, i) => [i, true])));
  };

  const deselectAll = () => {
    setSelected({});
  };

  const saveSelected = async () => {
    const tasks = suggestions
      .map((t, i) => ({ description: t.description, type: "interaction", order_index: i }))
      .filter((_, i) => selected[i]);
    if (tasks.length === 0) {
      setError("请先选择至少一条任务");
      return;
    }
    setError(null);
    startTransition(async () => {
      const { error } = await bulkInsertTasks(themeId, tasks);
      if (error) {
        setError(error);
      } else {
        setSuggestions([]);
        setSelected({});
        closeModal();
      }
    });
  };

  const genderText = preferences.gender === "male" ? "男性" : preferences.gender === "female" ? "女性" : preferences.gender === "non_binary" ? "非二元" : "未设置";
  const kinksText = (preferences.kinks && preferences.kinks.length > 0) ? preferences.kinks.join("、") : "未设置";
  const hasGender = !!preferences.gender;
  const hasKinks = Array.isArray(preferences.kinks) && preferences.kinks.length > 0;
  const preferencesEmpty = !hasGender || !hasKinks;

  return (
    <>
      {inline ? (
        <Button
          type="button"
          onClick={openModal}
          className="gradient-primary glow-pink text-white flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI 生成任务</span>
        </Button>
      ) : (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-pink" />
              <h3 className="text-lg font-bold">AI 生成任务</h3>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            基于主题和个人偏好，快速生成符合情侣互动的任务列表
          </p>
          <Button
            onClick={openModal}
            className="w-full gradient-primary glow-pink flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>开始生成</span>
          </Button>
        </div>
      )}

      {showModal && mounted && createPortal((
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass rounded-3xl p-6 max-w-md w-full glow-pink max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">AI 生成任务</h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {suggestions.length === 0 ? (
              <>
                <div className="space-y-4 mb-6">
                  <div className="glass rounded-xl p-4">
                    <p className="text-sm font-medium mb-2">当前主题</p>
                    <p className="text-gray-300">{themeTitle}</p>
                    {themeDescription && (
                      <p className="text-sm text-gray-400 mt-1">{themeDescription}</p>
                    )}
                  </div>

                  <div className="glass rounded-xl p-4">
                    <p className="text-sm font-medium mb-2">个人偏好</p>
                    <div className="text-sm space-y-1">
                      <p className="text-gray-300">性别：{genderText}</p>
                      <p className="text-gray-300">兴趣标签：{kinksText}</p>
                    </div>
                    {mounted && preferencesEmpty && (
                      <div className="mt-3">
                        <Link href="/profile" className="text-brand-pink hover:text-pink-300 underline text-xs">
                          去设置偏好以获得更精准的生成
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customRequirement" className="text-sm font-medium">
                      特别需求（可选）
                    </Label>
                    <textarea
                      id="customRequirement"
                      value={customRequirement}
                      onChange={(e) => setCustomRequirement(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm outline-none focus:border-brand-pink transition-all"
                      placeholder="例如：增加户外活动、避免需要高消费的任务、希望有更多情感交流类的内容..."
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={closeModal}
                    variant="outline"
                    className="flex-1 border-white/20 hover:bg-white/10"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={generate}
                    disabled={loading}
                    className="flex-1 gradient-primary glow-pink"
                  >
                    {loading ? "生成中..." : "生成任务"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-3">
                    已生成 {suggestions.length} 条任务，选择需要保存的任务
                  </p>
                  <div className="flex space-x-2 mb-4">
                    <Button
                      onClick={selectAll}
                      size="sm"
                      variant="outline"
                      className="border-white/20 hover:bg-white/10"
                    >
                      全选
                    </Button>
                    <Button
                      onClick={deselectAll}
                      size="sm"
                      variant="outline"
                      className="border-white/20 hover:bg-white/10"
                    >
                      取消全选
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {suggestions.map((s, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start space-x-3 rounded-xl p-3 border transition-all cursor-pointer ${
                          selected[idx]
                            ? "bg-brand-pink/10 border-brand-pink/30"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <Checkbox
                          checked={!!selected[idx]}
                          onCheckedChange={() => toggle(idx)}
                        />
                        <div className="flex-1">
                          <p className="text-sm">{s.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={closeModal}
                    variant="outline"
                    className="flex-1 border-white/20 hover:bg-white/10"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={saveSelected}
                    disabled={isPending || Object.values(selected).filter(Boolean).length === 0}
                    className="flex-1 gradient-primary glow-pink flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isPending ? "保存中..." : `保存 (${Object.values(selected).filter(Boolean).length})`}</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ), document.body)}
    </>
  );
}
