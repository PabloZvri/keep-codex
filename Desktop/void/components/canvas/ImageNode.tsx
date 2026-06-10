"use client";

import { memo, useState } from "react";
import { NodeProps, Node } from "@xyflow/react";
import { X, ExternalLink } from "lucide-react";
import { VoidNode, isInstagramPin } from "@/types";
import { cn } from "@/lib/utils";

export type ImageNodeData = {
  voidNode: VoidNode;
  onDelete: (id: string) => void;
};

export type ImageNodeType = Node<ImageNodeData, "imageNode">;

// Instagram gradient as a CSS linear-gradient string
const IG_GRADIENT = "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)";

function PlatformBadge({ node }: { node: VoidNode }) {
  if (isInstagramPin(node)) {
    return (
      <span className="flex items-center gap-1.5">
        {/* Instagram gradient dot */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: IG_GRADIENT }}
        />
        <span className="text-white/50 text-[10px] uppercase tracking-widest font-mono">
          Instagram
        </span>
      </span>
    );
  }

  if (node.platform === "arena") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-stone-400 flex-shrink-0" />
        <span className="text-white/50 text-[10px] uppercase tracking-widest font-mono">
          Are.na
        </span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
      <span className="text-white/50 text-[10px] uppercase tracking-widest font-mono">
        Pinterest
      </span>
    </span>
  );
}

function ImageNode({ data, selected }: NodeProps<ImageNodeType>) {
  const { voidNode, onDelete } = data;
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isIG = isInstagramPin(voidNode);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative rounded-xl overflow-hidden transition-all duration-200",
        "bg-[#111] shadow-xl shadow-black/60",
      )}
      style={{
        width: voidNode.width,
        height: voidNode.height,
        // Instagram nodes get a subtle gradient border via box-shadow / outline
        border: selected
          ? "1px solid rgba(255,255,255,0.6)"
          : hovered
          ? isIG
            ? "1px solid transparent"
            : "1px solid rgba(255,255,255,0.3)"
          : isIG
          ? "1px solid transparent"
          : "1px solid rgba(255,255,255,0.1)",
        // Gradient border trick for Instagram nodes
        boxShadow: isIG
          ? selected
            ? `0 0 0 2px rgba(255,255,255,0.2), inset 0 0 0 1px transparent`
            : hovered
            ? `0 0 0 1.5px #bc1888, 0 20px 60px rgba(0,0,0,0.6)`
            : `0 0 0 1px rgba(188,24,136,0.35), 0 20px 40px rgba(0,0,0,0.5)`
          : undefined,
      }}
    >
      {/* Image */}
      {voidNode.image_url && !imgError ? (
        <img
          src={voidNode.image_url}
          alt={voidNode.title ?? ""}
          className="w-full h-full object-cover block"
          draggable={false}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
          <span className="text-white/20 text-xs text-center px-3 leading-tight">
            {voidNode.title ?? "No image"}
          </span>
        </div>
      )}

      {/* Overlay on hover/select */}
      <div
        className={cn(
          "absolute inset-0 bg-black/70 flex flex-col justify-between p-2.5 transition-opacity duration-150",
          hovered || selected ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Top: platform badge + delete */}
        <div className="flex items-center justify-between">
          <PlatformBadge node={voidNode} />
          <button
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(voidNode.id);
            }}
          >
            <X size={10} className="text-white/60" />
          </button>
        </div>

        {/* Bottom: title + link */}
        <div className="flex items-end justify-between gap-1">
          {voidNode.title && (
            <span className="text-white/80 text-[11px] leading-tight line-clamp-2 font-light flex-1">
              {voidNode.title}
            </span>
          )}
          {voidNode.source_url && (
            <a
              href={voidNode.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <ExternalLink size={10} className="text-white/60" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ImageNode);
