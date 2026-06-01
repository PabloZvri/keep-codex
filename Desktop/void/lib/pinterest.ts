import { PinterestBoard, PinterestPin } from "@/types";

const PINTEREST_API = "https://api.pinterest.com/v5";

export async function fetchPinterestBoards(
  accessToken: string
): Promise<PinterestBoard[]> {
  const boards: PinterestBoard[] = [];
  let bookmark: string | undefined;

  do {
    const url = new URL(`${PINTEREST_API}/boards`);
    url.searchParams.set("page_size", "100");
    if (bookmark) url.searchParams.set("bookmark", bookmark);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Pinterest boards fetch failed: ${res.status} ${JSON.stringify(err)}`
      );
    }

    const data = await res.json();
    boards.push(...(data.items ?? []));
    bookmark = data.bookmark;
  } while (bookmark);

  return boards;
}

export async function fetchPinterestPins(
  accessToken: string,
  boardId: string
): Promise<PinterestPin[]> {
  const pins: PinterestPin[] = [];
  let bookmark: string | undefined;

  do {
    const url = new URL(`${PINTEREST_API}/boards/${boardId}/pins`);
    url.searchParams.set("page_size", "100");
    if (bookmark) url.searchParams.set("bookmark", bookmark);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      // Skip boards that return errors (e.g. empty secret boards)
      break;
    }

    const data = await res.json();
    pins.push(...(data.items ?? []));
    bookmark = data.bookmark;
  } while (bookmark);

  return pins;
}

export async function fetchAllPins(
  accessToken: string
): Promise<{ boards: PinterestBoard[]; pins: PinterestPin[] }> {
  const boards = await fetchPinterestBoards(accessToken);

  const pinArrays = await Promise.all(
    boards.map((board) =>
      fetchPinterestPins(accessToken, board.id).catch(() => [])
    )
  );

  const pins = pinArrays.flat();
  return { boards, pins };
}
