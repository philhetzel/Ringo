import { handler } from "@/tools/retrieval_tool";

export async function POST(req: Request) {
  const data = await req.json();
  console.log(data);
  const { prompt: query } = data;
  const docs = await handler(query);
  return docs;
}
