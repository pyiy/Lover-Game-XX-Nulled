"use client";

import { useState } from "react";
import { updateNickname } from "@/app/profile/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NicknameEditor({ initialNickname }: { initialNickname: string | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(initialNickname ?? "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setError("");
    setIsLoading(true);
    const result = await updateNickname(nickname);
    setIsLoading(false);

    if (result.ok) {
      setIsEditing(false);
    } else {
      setError(result.error ?? "保存失败");
    }
  };

  const handleCancel = () => {
    setNickname(initialNickname ?? "");
    setError("");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="输入昵称"
            maxLength={100}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
            disabled={isLoading}
          />
          <Button
            onClick={handleSave}
            disabled={isLoading || !nickname.trim()}
            size="sm"
            className="bg-white/20 hover:bg-white/30 rounded-xl font-medium active:scale-[0.95]"
          >
            保存
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            size="sm"
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl active:scale-[0.95]"
          >
            取消
          </Button>
        </div>
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold text-white truncate">{nickname || "未设置昵称"}</h3>
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm font-medium text-white/90 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 active:scale-[0.95]"
      >
        编辑
      </button>
    </div>
  );
}
