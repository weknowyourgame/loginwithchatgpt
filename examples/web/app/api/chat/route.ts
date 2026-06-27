import { createClient } from "loginwithchatgpt";

export const runtime = "nodejs";

// AI call billed to the logged-in user's ChatGPT subscription.
export async function POST(req: Request): Promise<Response> {
  const { prompt } = (await req.json()) as { prompt?: string };
  if (!prompt) return Response.json({ error: "Missing prompt" }, { status: 400 });

  try {
    const text = await createClient().respond(prompt);
    return Response.json({ text });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Request failed" }, { status: 500 });
  }
}
