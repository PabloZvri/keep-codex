import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import VoidCanvas from "@/components/canvas/VoidCanvas";
import { VoidNode, VoidGroup } from "@/types";

export const dynamic = "force-dynamic";

export default async function CanvasPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const extSession = session as Record<string, unknown> & typeof session;
  const hasPinterest = !!extSession.pinterest_access_token;
  const hasArena = !!extSession.arena_access_token;

  // Redirect to login if no connected accounts
  if (!hasPinterest && !hasArena) {
    redirect("/login");
  }

  const db = createServerSupabase();
  const userId = session.user.id;

  // Fetch nodes and groups server-side for SSR
  const [nodesResult, groupsResult] = await Promise.all([
    db
      .from("void_nodes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    db
      .from("void_groups")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  const nodes: VoidNode[] = nodesResult.data ?? [];
  const groups: VoidGroup[] = groupsResult.data ?? [];

  return (
    <main className="w-full h-screen overflow-hidden">
      <VoidCanvas initialNodes={nodes} initialGroups={groups} />
    </main>
  );
}
