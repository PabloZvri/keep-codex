import { ArenaChannel, ArenaBlock } from "@/types";

const ARENA_API = "https://api.are.na/v2";

export async function fetchArenaChannels(
  accessToken: string
): Promise<ArenaChannel[]> {
  const res = await fetch(`${ARENA_API}/me/channels?per=100`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Auth-Token": accessToken,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Are.na channels fetch failed: ${res.status} ${JSON.stringify(err)}`
    );
  }

  const data = await res.json();
  return data.channels ?? data ?? [];
}

export async function fetchArenaBlocks(
  accessToken: string,
  channelSlug: string
): Promise<ArenaBlock[]> {
  const blocks: ArenaBlock[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `${ARENA_API}/channels/${channelSlug}/contents?page=${page}&per=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Auth-Token": accessToken,
        },
      }
    );

    if (!res.ok) break;

    const data = await res.json();
    const contents: ArenaBlock[] = data.contents ?? [];

    if (contents.length === 0) break;

    // Only include blocks with images or links with thumbnails
    const visual = contents.filter(
      (b) =>
        (b.class === "Image" && b.image) ||
        (b.class === "Link" && b.image) ||
        (b.class === "Media" && b.image)
    );

    blocks.push(...visual);

    if (contents.length < perPage) break;
    page++;
  }

  return blocks;
}

export async function fetchAllArenaContent(
  accessToken: string
): Promise<{ channels: ArenaChannel[]; blocks: ArenaBlock[] }> {
  const channels = await fetchArenaChannels(accessToken);

  const blockArrays = await Promise.all(
    channels.map((ch) =>
      fetchArenaBlocks(accessToken, ch.slug).catch(() => [])
    )
  );

  const blocks = blockArrays.flat();
  return { channels, blocks };
}
