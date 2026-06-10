"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  NodeChange,
  OnNodesChange,
  applyNodeChanges,
  NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { VoidNode, VoidGroup, ActiveFilter, isInstagramPin } from "@/types";
import { FilterBar } from "./FilterBar";
import { Toolbar } from "./Toolbar";
import { useSession } from "next-auth/react";
import ImageNode, { ImageNodeData } from "./ImageNode";
import GroupNode, { GroupNodeData } from "./GroupNode";

const nodeTypes: NodeTypes = {
  imageNode: ImageNode as NodeTypes[string],
  groupNode: GroupNode as NodeTypes[string],
};

interface VoidCanvasProps {
  initialNodes: VoidNode[];
  initialGroups: VoidGroup[];
}

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): T {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay]
  ) as T;
}

export function VoidCanvas({ initialNodes, initialGroups }: VoidCanvasProps) {
  const { data: session } = useSession();
  const extSession = session as Record<string, unknown> & typeof session;

  const connectedPinterest = !!extSession?.pinterest_access_token;
  const connectedArena = !!extSession?.arena_access_token;

  const [voidNodes, setVoidNodes] = useState<VoidNode[]>(initialNodes);
  const [voidGroups, setVoidGroups] = useState<VoidGroup[]>(initialGroups);
  const [filter, setFilter] = useState<ActiveFilter>("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const pendingPositions = useRef<
    Map<string, { position_x: number; position_y: number }>
  >(new Map());

  // Delete a node
  const deleteNode = useCallback(async (id: string) => {
    setVoidNodes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/canvas/nodes?id=${id}`, { method: "DELETE" }).catch(console.error);
  }, []);

  // Delete a group
  const deleteGroup = useCallback(async (id: string) => {
    setVoidGroups((prev) => prev.filter((g) => g.id !== id));
    await fetch(`/api/canvas/groups?id=${id}`, { method: "DELETE" }).catch(console.error);
  }, []);

  // Update group label
  const updateGroupLabel = useCallback(async (id: string, label: string) => {
    setVoidGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, label } : g))
    );
    await fetch("/api/canvas/groups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, label }),
    }).catch(console.error);
  }, []);

  // Build React Flow nodes from state
  const flowNodes: Node[] = useMemo(() => {
    const filtered =
      filter === "all"
        ? voidNodes
        : filter === "instagram"
        ? voidNodes.filter(isInstagramPin)
        : voidNodes.filter((n) => n.platform === filter && !isInstagramPin(n));

    const imageNodes: Node[] = filtered.map((n): Node<ImageNodeData, "imageNode"> => ({
      id: n.id,
      type: "imageNode" as const,
      position: { x: n.position_x, y: n.position_y },
      data: {
        voidNode: n,
        onDelete: deleteNode,
      },
      zIndex: 10,
      draggable: true,
      selectable: true,
    }));

    const groupNodes: Node[] = voidGroups.map((g): Node<GroupNodeData, "groupNode"> => ({
      id: `group_${g.id}`,
      type: "groupNode" as const,
      position: { x: g.position_x, y: g.position_y },
      style: { width: g.width, height: g.height },
      data: {
        group: g,
        onDelete: deleteGroup,
        onLabelChange: updateGroupLabel,
      },
      zIndex: 1,
      draggable: true,
      selectable: true,
    }));

    return [...groupNodes, ...imageNodes];
  }, [voidNodes, voidGroups, filter, deleteNode, deleteGroup, updateGroupLabel]);

  const [rfNodes, setRfNodes] = useNodesState(flowNodes);
  const [, , onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setRfNodes(flowNodes);
  }, [flowNodes, setRfNodes]);

  // Save positions to DB (debounced + batched)
  const flushPositions = useCallback(async () => {
    if (pendingPositions.current.size === 0) return;
    const updates = Array.from(pendingPositions.current.entries()).map(
      ([id, pos]) => ({ id, ...pos })
    );
    pendingPositions.current.clear();

    const nodeUpdates = updates.filter((u) => !u.id.startsWith("group_"));
    const groupUpdates = updates.filter((u) => u.id.startsWith("group_"));

    if (nodeUpdates.length > 0) {
      await fetch("/api/canvas/nodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: nodeUpdates }),
      }).catch(console.error);
    }

    for (const gu of groupUpdates) {
      await fetch("/api/canvas/groups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: gu.id.replace("group_", ""),
          position_x: gu.position_x,
          position_y: gu.position_y,
        }),
      }).catch(console.error);
    }
  }, []);

  const debouncedFlush = useDebouncedCallback(flushPositions, 800);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setRfNodes((nds) => applyNodeChanges(changes, nds));

      for (const change of changes) {
        if (change.type === "position" && change.position && !change.dragging) {
          pendingPositions.current.set(change.id, {
            position_x: change.position.x,
            position_y: change.position.y,
          });
          debouncedFlush();

          if (change.id.startsWith("group_")) {
            const realId = change.id.replace("group_", "");
            setVoidGroups((prev) =>
              prev.map((g) =>
                g.id === realId
                  ? { ...g, position_x: change.position!.x, position_y: change.position!.y }
                  : g
              )
            );
          } else {
            setVoidNodes((prev) =>
              prev.map((n) =>
                n.id === change.id
                  ? { ...n, position_x: change.position!.x, position_y: change.position!.y }
                  : n
              )
            );
          }
        }

        if (change.type === "dimensions" && change.dimensions && change.id.startsWith("group_")) {
          const realId = change.id.replace("group_", "");
          const { width, height } = change.dimensions;
          if (width && height) {
            setVoidGroups((prev) =>
              prev.map((g) => (g.id === realId ? { ...g, width, height } : g))
            );
            fetch("/api/canvas/groups", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: realId, width, height }),
            }).catch(console.error);
          }
        }
      }
    },
    [debouncedFlush, setRfNodes]
  );

  // Add group
  const handleAddGroup = useCallback(async (color: string) => {
    const res = await fetch("/api/canvas/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: "New Group",
        color,
        position_x: 200 + Math.random() * 400,
        position_y: 200 + Math.random() * 400,
        width: 440,
        height: 340,
      }),
    });
    if (res.ok) {
      const { group } = await res.json();
      setVoidGroups((prev) => [...prev, group]);
    }
  }, []);

  // Sync Pinterest
  const handleSyncPinterest = useCallback(async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/pinterest/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(`+${data.synced} Pinterest pins synced`);
        const nodesRes = await fetch("/api/canvas/nodes");
        if (nodesRes.ok) {
          const { nodes } = await nodesRes.json();
          setVoidNodes(nodes);
        }
      } else {
        setSyncMessage(`Pinterest: ${data.error}`);
      }
    } catch {
      setSyncMessage("Pinterest sync failed");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  }, []);

  // Sync Are.na
  const handleSyncArena = useCallback(async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/arena/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(`+${data.synced} Are.na blocks synced`);
        const nodesRes = await fetch("/api/canvas/nodes");
        if (nodesRes.ok) {
          const { nodes } = await nodesRes.json();
          setVoidNodes(nodes);
        }
      } else {
        setSyncMessage(`Are.na: ${data.error}`);
      }
    } catch {
      setSyncMessage("Are.na sync failed");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  }, []);

  const counts = useMemo(
    () => ({
      all: voidNodes.length,
      instagram: voidNodes.filter(isInstagramPin).length,
      pinterest: voidNodes.filter((n) => n.platform === "pinterest" && !isInstagramPin(n)).length,
      arena: voidNodes.filter((n) => n.platform === "arena").length,
    }),
    [voidNodes]
  );

  return (
    <div className="w-full h-screen bg-[#080808] relative">
      <ReactFlow
        nodes={rfNodes}
        edges={[]}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView={rfNodes.length > 0}
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        minZoom={0.05}
        maxZoom={2.5}
        panOnScroll
        selectionOnDrag
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={null}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="rgba(255,255,255,0.07)"
        />
        <Controls
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === "groupNode") return "rgba(255,255,255,0.05)";
            const d = n.data as ImageNodeData;
            return d?.voidNode?.platform === "pinterest"
              ? "rgba(220,80,80,0.6)"
              : "rgba(160,160,150,0.6)";
          }}
          style={{
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
          }}
          maskColor="rgba(0,0,0,0.7)"
        />
      </ReactFlow>

      {/* VOID wordmark */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none">
        <span className="text-[11px] text-white/15 font-mono tracking-[0.5em] uppercase">
          VOID
        </span>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
        <FilterBar active={filter} onChange={setFilter} counts={counts} />
        <Toolbar
          onAddGroup={handleAddGroup}
          onSyncPinterest={handleSyncPinterest}
          onSyncArena={handleSyncArena}
          isSyncing={isSyncing}
          connectedPinterest={connectedPinterest}
          connectedArena={connectedArena}
        />
      </div>

      {/* Toast */}
      {syncMessage && (
        <div className="absolute top-5 right-5 bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white/60 font-light z-50 shadow-xl shadow-black/50">
          {syncMessage}
        </div>
      )}

      {/* Empty state */}
      {voidNodes.length === 0 && !isSyncing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <p className="text-white/20 text-sm font-light tracking-wide mb-1">
            Your void is empty
          </p>
          <p className="text-white/10 text-xs font-light">
            Connect accounts and sync to populate your canvas
          </p>
        </div>
      )}
    </div>
  );
}

export default function VoidCanvasWithProvider(props: VoidCanvasProps) {
  return (
    <ReactFlowProvider>
      <VoidCanvas {...props} />
    </ReactFlowProvider>
  );
}
