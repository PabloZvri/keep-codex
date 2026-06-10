export type Platform = "pinterest" | "arena";

export interface VoidNode {
  id: string;
  user_id: string;
  platform: Platform;
  source_id: string;
  title: string | null;
  image_url: string | null;
  source_url: string | null;
  width: number;
  height: number;
  position_x: number;
  position_y: number;
  group_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoidGroup {
  id: string;
  user_id: string;
  label: string;
  color: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  platform: Platform;
  platform_user_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: number | null;
  created_at: string;
}

// Pinterest types
export interface PinterestBoard {
  id: string;
  name: string;
  description: string | null;
  pin_count: number;
  media: {
    image_cover_url: string | null;
  } | null;
}

export interface PinterestPin {
  id: string;
  title: string | null;
  description: string | null;
  media: {
    images: {
      "236x": { url: string; width: number; height: number };
      "400x300": { url: string; width: number; height: number };
      "600x": { url: string; width: number; height: number };
      "1200x": { url: string; width: number; height: number };
    };
    media_type: string;
  } | null;
  link: string | null;
  board_id: string;
}

// Are.na types
export interface ArenaChannel {
  id: number;
  title: string;
  slug: string;
  length: number;
  status: string;
  user: {
    id: number;
    username: string;
  };
}

export interface ArenaBlock {
  id: number;
  title: string | null;
  description: string | null;
  class: "Image" | "Link" | "Text" | "Media" | "Attachment" | "Channel";
  image: {
    original: { url: string };
    large: { url: string };
    thumb: { url: string };
  } | null;
  source: {
    url: string;
    title?: string;
    provider?: {
      name: string;
      url: string;
    };
  } | null;
  channel_id: number;
}

// Canvas node (React Flow)
export type NodeData = {
  node: VoidNode;
  onDelete: (id: string) => void;
};

export type GroupData = {
  group: VoidGroup;
  onDelete: (id: string) => void;
  onLabelChange: (id: string, label: string) => void;
};

export type ActiveFilter = "all" | Platform | "instagram";

// Detect Instagram-sourced pins (auto-published from Pinterest's Instagram link)
export function isInstagramPin(node: VoidNode): boolean {
  return (
    node.platform === "pinterest" &&
    !!node.source_url &&
    node.source_url.includes("instagram.com")
  );
}

export interface CanvasState {
  nodes: VoidNode[];
  groups: VoidGroup[];
  filter: ActiveFilter;
  isSyncing: boolean;
  isFetching: boolean;
}
