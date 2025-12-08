"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

type Props = {
  email?: string | null;
  userId?: string | null;
};

export default function CopyAccountButton({ email, userId }: Props) {
  const [showToast, setShowToast] = useState(false);

  const onCopy = async () => {
    let storedEmail: string | null = null;
    let storedPassword: string | null = null;
    try {
      const raw = localStorage.getItem("account_credentials");
      if (raw) {
        const obj = JSON.parse(raw);
        storedEmail = typeof obj?.email === "string" ? obj.email : null;
        storedPassword = typeof obj?.password === "string" ? obj.password : null;
      }
    } catch {}

    const finalEmail = storedEmail ?? email ?? "—";
    const finalPassword = storedPassword ?? "—";
    const accountInfo = `账号: ${finalEmail}\n密码: ${finalPassword}`;
    try {
      await navigator.clipboard.writeText(accountInfo);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = accountInfo;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
      {showToast && (
        <div className="fixed top-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-black/80 px-4 py-2 text-sm text-white">
          已复制账号与密码
        </div>
      )}
      <button
        onClick={onCopy}
        className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
        aria-label="复制账号和密码"
        title="复制账号和密码"
      >
        <Copy className="w-5 h-5 text-white" />
      </button>
    </>
  );
}