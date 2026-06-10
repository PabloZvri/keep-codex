"use client";

import { memo, useState, useRef, useCallback } from "react";
import { NodeProps, NodeResizer, Node } from "@xyflow/react";
import { Trash2, Pencil, Check } from "lucide-react";
import { VoidGroup } from "@/types";
import { cn } from "@/lib/utils";

export type GroupNodeData = {
  group: VoidGroup;
  onDelete: (id: string) => void;
  onLabelChange: (id: string, label: string) => void;
};

export type GroupNodeType = Node<GroupNodeData, "groupNode">;

function GroupNode({ data, selected }: NodeProps<GroupNodeType>) {
  const { group, onDelete, onLabelChange } = data;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(group.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const commitLabel = useCallback(() => {
    setEditing(false);
    if (draft.trim() && draft !== group.label) {
      onLabelChange(group.id, draft.trim());
    }
  }, [draft, group.id, group.label, onLabelChange]);

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={120}
        lineStyle={{ borderColor: "rgba(255,255,255,0.3)" }}
        handleStyle={{
          background: "rgba(255,255,255,0.3)",
          border: "none",
          borderRadius: 4,
        }}
      />
      <div
        className={cn(
          "w-full h-full rounded-2xl border transition-all duration-200 relative",
          selected ? "border-white/30" : "border-white/10"
        )}
        style={{ background: group.color }}
      >
        {/* Label bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between gap-1 px-3 py-1.5">
          {editing ? (
            <input
              ref={inputRef}
              className="bg-transparent text-white/80 text-xs font-light tracking-wide outline-none border-b border-white/30 flex-1 min-w-0"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitLabel();
                if (e.key === "Escape") {
                  setDraft(group.label);
                  setEditing(false);
                }
              }}
              autoFocus
            />
          ) : (
            <span
              className="text-white/60 text-xs font-light tracking-wide flex-1 min-w-0 truncate cursor-text"
              onDoubleClick={() => {
                setEditing(true);
                setDraft(group.label);
                setTimeout(() => inputRef.current?.select(), 10);
              }}
            >
              {group.label}
            </span>
          )}

          <div className="flex items-center gap-1 flex-shrink-0">
            {editing ? (
              <button
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  commitLabel();
                }}
              >
                <Check size={10} className="text-white/60" />
              </button>
            ) : (
              <button
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                onClick={() => {
                  setEditing(true);
                  setDraft(group.label);
                }}
              >
                <Pencil size={10} className="text-white/60" />
              </button>
            )}
            <button
              className="w-5 h-5 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
              onClick={() => onDelete(group.id)}
            >
              <Trash2 size={10} className="text-white/60" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(GroupNode);
