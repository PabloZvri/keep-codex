import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  const extSession = session as Record<string, unknown> & typeof session;

  if (session?.user && (extSession.pinterest_access_token || extSession.arena_access_token)) {
    redirect("/canvas");
  }

  redirect("/login");
}
