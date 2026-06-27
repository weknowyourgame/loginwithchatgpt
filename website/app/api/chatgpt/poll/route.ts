import { accountInfo, devicePoll } from "loginwithchatgpt";

import { writeTokens } from "@/lib/session-cookie";

export const runtime = "nodejs";

// Poll once. On completion, store tokens in an httpOnly cookie and return the session.
export async function POST(req: Request): Promise<Response> {
  const { deviceAuthId, userCode } = (await req.json()) as {
    deviceAuthId?: string;
    userCode?: string;
  };
  if (!deviceAuthId || !userCode) {
    return Response.json({ error: "Missing deviceAuthId or userCode" }, { status: 400 });
  }

  try {
    const result = await devicePoll(deviceAuthId, userCode);
    if (result.status === "pending") {
      return Response.json({ status: "pending" });
    }

    await writeTokens(result.tokens);
    const info = accountInfo(result.tokens);
    return Response.json({
      status: "complete",
      account: { email: info.email, id: info.accountId },
      plan: { name: info.plan }
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Poll failed" }, { status: 500 });
  }
}
