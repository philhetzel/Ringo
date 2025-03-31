import {handler} from "@/tools/retrieval_tool"

export async function POST(req: Request) {
  const { prompt: query } = await req.json();
  const playlist = await handleRequest(query);
  return BraintrustAdapter.toAIStreamResponse(playlist);
}