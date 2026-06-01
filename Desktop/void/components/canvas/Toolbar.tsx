"use client";

import { Plus, RotateCcw, Download, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { GROUP_COLORS } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface ToolbarProps {
  onAddGroup: (color: string) => void;
  onSyncPinterest: () => void;
  onSyncArena: () => void;
  isSyncing: boolean;
  connectedPinterest: boolean;
  connectedArena: boolean;
}

export function Toolbar({
  onAddGroup,
  onSyncPinterest,
  onSyncArena,
  isSyncing,
  connectedPinterest,
  connectedArena,
}: ToolbarProps) {
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowGroupPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-[#0e0e0e]/80 border border-white/10 rounded-xl px-2 py-1.5 backdrop-blur-md">
      {/* Add group button */}
      <div className="relative" ref={pickerRef}>
        <button
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-light text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150"
          )}
          onClick={() => setShowGroupPicker((v) => !v)}
          title="Add group"
        >
          <Plus size={13} />
          Group
        </button>

        {showGroupPicker && (
          <div className="absolute bottom-full mb-2 left-0 bg-[#111] border border-white/10 rounded-xl p-2 flex flex-col gap-1 shadow-xl shadow-black/60 z-50 min-w-[120px]">
            <span className="text-[10px] text-white/30 px-1 mb-0.5 uppercase tracking-widest font-mono">
              Color
            </span>
            {GROUP_COLORS.map((c) => (
              <button
                key={c.value}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 text-xs text-white/70 transition-colors"
                onClick={() => {
                  onAddGroup(c.value);
                  setShowGroupPicker(false);
                }}
              >
                <span
                  className="w-3 h-3 rounded-full border"
                  style={{ background: c.value, borderColor: c.border }}
                />
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-white/10" />

      {/* Sync buttons */}
      {connectedPinterest && (
        <button
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-light transition-all duration-150",
            isSyncing
              ? "text-white/30 cursor-not-allowed"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
          onClick={onSyncPinterest}
          disabled={isSyncing}
          title="Sync Pinterest"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          <RotateCcw size={11} className={isSyncing ? "animate-spin" : ""} />
          Sync
        </button>
      )}

      {connectedArena && (
        <button
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-light transition-all duration-150",
            isSyncing
              ? "text-white/30 cursor-not-allowed"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
          onClick={onSyncArena}
          disabled={isSyncing}
          title="Sync Are.na"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
          <RotateCcw size={11} className={isSyncing ? "animate-spin" : ""} />
          Sync
        </button>
      )}

      <div className="w-px h-4 bg-white/10" />

      <button
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-light text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150"
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Sign out"
      >
        <LogOut size={11} />
        Exit
      </button>
    </div>
  );
}
