"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export function Toast({ message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
      <div className="glass rounded-xl px-6 py-3 shadow-lg">
        <p className="text-sm text-white">{message}</p>
      </div>
    </div>
  );
}

export function useToast() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  const showToast = (msg: string) => {
    setMessage(msg);
    setShow(true);
  };

  const hideToast = () => setShow(false);

  return { show, message, showToast, hideToast };
}
