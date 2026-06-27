import { deviceStart } from "loginwithchatgpt";

export const runtime = "nodejs";

// Begin a device-code login: returns the code to show and ids to poll with.
export async function POST(): Promise<Response> {
  try {
    const start = await deviceStart();
    return Response.json(start);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Failed to start" }, { status: 500 });
  }
}
