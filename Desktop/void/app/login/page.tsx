import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ConnectAccounts } from "@/components/auth/ConnectAccounts";

export default async function LoginPage() {
  const session = await auth();
  const extSession = session as Record<string, unknown> & typeof session;

  // If user is logged in and has at least one connection, go to canvas
  if (session?.user && (extSession.pinterest_access_token || extSession.arena_access_token)) {
    redirect("/canvas");
  }

  const connectedPinterest = !!extSession?.pinterest_access_token;
  const connectedArena = !!extSession?.arena_access_token;

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-8">
      {/* Background grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-xs">
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-[13px] font-mono tracking-[0.5em] text-white/90 uppercase">
            VOID
          </h1>
          <p className="text-[13px] text-white/30 font-light text-center leading-relaxed">
            All your saved content.
            <br />
            One infinite space.
          </p>
        </div>

        {/* Connect accounts */}
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-[11px] text-white/25 uppercase tracking-widest font-mono">
            Connect accounts
          </p>
          <ConnectAccounts
            connectedPinterest={connectedPinterest}
            connectedArena={connectedArena}
          />
        </div>

        {/* Data privacy note */}
        <p className="text-[11px] text-white/15 text-center font-light leading-relaxed max-w-[220px]">
          Read-only access only. Images are never stored on our servers.
        </p>
      </div>
    </div>
  );
}
