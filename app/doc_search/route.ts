
import {handler} from "@/tools/retrieval_tool"

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const docs = await handler(prompt);
  console.log("Doc search results:", docs);
  return new Response(JSON.stringify(docs), {
    headers: { 'Content-Type': 'application/json' },
  });
}
