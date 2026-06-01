"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface ConnectAccountsProps {
  connectedPinterest: boolean;
  connectedArena: boolean;
}

export function ConnectAccounts({
  connectedPinterest,
  connectedArena,
}: ConnectAccountsProps) {
  const [loadingPinterest, setLoadingPinterest] = useState(false);
  const [loadingArena, setLoadingArena] = useState(false);

  const connectPinterest = async () => {
    setLoadingPinterest(true);
    await signIn("pinterest", { callbackUrl: "/canvas" });
  };

  const connectArena = async () => {
    setLoadingArena(true);
    await signIn("arena", { callbackUrl: "/canvas" });
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      {/* Pinterest */}
      <button
        onClick={connectPinterest}
        disabled={connectedPinterest || loadingPinterest}
        className={cn(
          "flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-light transition-all duration-150",
          connectedPinterest
            ? "border-white/10 text-white/30 cursor-default bg-white/[0.02]"
            : "border-white/15 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/5 cursor-pointer"
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Pinterest</span>
        </div>
        <div className="flex items-center gap-1.5">
          {loadingPinterest && <Spinner size={14} />}
          {connectedPinterest ? (
            <span className="text-[11px] text-white/30 font-mono">Connected</span>
          ) : (
            <span className="text-[11px] text-white/30">Connect →</span>
          )}
        </div>
      </button>

      {/* Are.na */}
      <button
        onClick={connectArena}
        disabled={connectedArena || loadingArena}
        className={cn(
          "flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-light transition-all duration-150",
          connectedArena
            ? "border-white/10 text-white/30 cursor-default bg-white/[0.02]"
            : "border-white/15 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/5 cursor-pointer"
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-stone-400" />
          <span>Are.na</span>
        </div>
        <div className="flex items-center gap-1.5">
          {loadingArena && <Spinner size={14} />}
          {connectedArena ? (
            <span className="text-[11px] text-white/30 font-mono">Connected</span>
          ) : (
            <span className="text-[11px] text-white/30">Connect →</span>
          )}
        </div>
      </button>
    </div>
  );
}
