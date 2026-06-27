import { accountInfo } from "loginwithchatgpt";

import { readTokens } from "@/lib/session-cookie";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const tokens = await readTokens();
  if (!tokens) return Response.json(null);
  const info = accountInfo(tokens);
  return Response.json({
    status: "connected",
    account: { email: info.email, id: info.accountId },
    plan: { name: info.plan }
  });
}
