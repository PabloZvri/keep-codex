import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/canvas/nodes — fetch all nodes for the authed user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServerSupabase();
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");

  let query = db
    .from("void_nodes")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });

  if (platform && platform !== "all") {
    query = query.eq("platform", platform);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ nodes: data ?? [] });
}

// PATCH /api/canvas/nodes — bulk update positions
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updates: Array<{ id: string; position_x: number; position_y: number; group_id?: string | null }> =
    body.updates ?? [];

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  const db = createServerSupabase();
  const userId = session.user.id;

  // Validate ownership and update
  const { error } = await db
    .from("void_nodes")
    .upsert(
      updates.map((u) => ({
        id: u.id,
        user_id: userId,
        position_x: u.position_x,
        position_y: u.position_y,
        ...(u.group_id !== undefined ? { group_id: u.group_id } : {}),
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ updated: updates.length });
}

// DELETE /api/canvas/nodes?id=xxx
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const db = createServerSupabase();
  const { error } = await db
    .from("void_nodes")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
