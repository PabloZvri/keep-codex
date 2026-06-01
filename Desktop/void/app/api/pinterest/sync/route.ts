import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchAllPins } from "@/lib/pinterest";
import { createServerSupabase } from "@/lib/supabase";
import { VoidNode } from "@/types";
import { pickBestPinterestImage } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const extSession = session as Record<string, unknown> & typeof session;
  const accessToken = extSession.pinterest_access_token as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Pinterest not connected" },
      { status: 400 }
    );
  }

  const db = createServerSupabase();
  const userId = session.user.id;

  try {
    const { boards, pins } = await fetchAllPins(accessToken);

    // Fetch existing nodes to compute positions for new ones
    const { data: existingNodes } = await db
      .from("void_nodes")
      .select("source_id, position_x, position_y")
      .eq("user_id", userId)
      .eq("platform", "pinterest");

    const existingIds = new Set(
      (existingNodes ?? []).map((n: { source_id: string }) => n.source_id)
    );

    const newPins = pins.filter((p) => !existingIds.has(p.id));

    if (newPins.length === 0) {
      return NextResponse.json({
        synced: 0,
        total: pins.length,
        boards: boards.length,
      });
    }

    // Scatter new nodes in a grid layout starting from a random offset
    const SPACING = 280;
    const COLS = Math.ceil(Math.sqrt(newPins.length));
    const offsetX = Math.random() * 2000;
    const offsetY = Math.random() * 2000;

    const rows: VoidNode[] = newPins
      .filter((pin) => pin.media?.images)
      .map((pin, i) => {
        const img = pickBestPinterestImage(pin.media!.images);
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        return {
          id: crypto.randomUUID(),
          user_id: userId,
          platform: "pinterest" as const,
          source_id: pin.id,
          title: pin.title ?? null,
          image_url: img?.url ?? null,
          source_url: pin.link ?? `https://pinterest.com/pin/${pin.id}`,
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
      total: pins.length,
      boards: boards.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[pinterest/sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
