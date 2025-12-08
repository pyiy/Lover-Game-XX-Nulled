"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    if (isLoading) return;
    const ok = typeof window !== "undefined" ? window.confirm("确认退出登录？") : true;
    if (!ok) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
    } catch (e) {
      if (typeof window !== "undefined") {
        window.alert("退出失败，请稍后重试");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={logout} variant="destructive" disabled={isLoading} className="w-full">
      {isLoading ? "正在退出..." : "退出登录"}
    </Button>
  );
}
