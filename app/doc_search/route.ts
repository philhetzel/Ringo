import {handler} from "@/tools/retrieval_tool"

export async function POST(req: Request) {
  const { prompt: query } = await req.json();
  const docs = await handler(query);
}