import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchAllArenaContent } from "@/lib/arena";
import { createServerSupabase } from "@/lib/supabase";
import { VoidNode } from "@/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const extSession = session as Record<string, unknown> & typeof session;
  const accessToken = extSession.arena_access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Are.na not connected" },
      { status: 400 }
    );
  }

  const db = createServerSupabase();
  const userId = session.user.id;

  try {
    const { channels, blocks } = await fetchAllArenaContent(accessToken);

    const { data: existingNodes } = await db
      .from("void_nodes")
      .select("source_id")
      .eq("user_id", userId)
      .eq("platform", "arena");

    const existingIds = new Set(
      (existingNodes ?? []).map((n: { source_id: string }) => n.source_id)
    );

    const newBlocks = blocks.filter((b) => !existingIds.has(String(b.id)));

    if (newBlocks.length === 0) {
      return NextResponse.json({
        synced: 0,
        total: blocks.length,
        channels: channels.length,
      });
    }

    const SPACING = 280;
    const COLS = Math.ceil(Math.sqrt(newBlocks.length));
    const offsetX = 3000 + Math.random() * 2000;
    const offsetY = Math.random() * 2000;

    const rows: VoidNode[] = newBlocks
      .filter((block) => block.image)
      .map((block, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const imageUrl =
          block.image?.large?.url ?? block.image?.original?.url ?? null;
        return {
          id: crypto.randomUUID(),
          user_id: userId,
          platform: "arena" as const,
          source_id: String(block.id),
          title: block.title ?? null,
          image_url: imageUrl,
          source_url:
            block.source?.url ??
            `https://www.are.na/block/${block.id}`,
          width: 220,
          height: 220,
          position_x: offsetX + col * SPACING,
          position_y: offsetY + row * SPACING,
          group_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

    if (rows.length > 0) {
      const { error } = await db.from("void_nodes").upsert(rows, {
        onConflict: "user_id,platform,source_id",
        ignoreDuplicates: true,
      });

      if (error) throw error;
    }

    return NextResponse.json({
      synced: rows.length,
      total: blocks.length,
      channels: channels.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[arena/sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
