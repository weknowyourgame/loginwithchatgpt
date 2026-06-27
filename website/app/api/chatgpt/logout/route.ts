import { clearTokens } from "@/lib/session-cookie";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  await clearTokens();
  return Response.json({ ok: true });
}
