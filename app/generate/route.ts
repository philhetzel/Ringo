import { invoke, initLogger, wrapTraced } from "braintrust";
import { BraintrustAdapter } from "@braintrust/vercel-ai-sdk";
import { PROJECT_NAME, PROMPT_SLUG } from "@/lib/constants";

const logger = initLogger({
  projectName: PROJECT_NAME,
  apiKey: process.env.BRAINTRUST_API_KEY,
  // It is safe to set the "asyncFlush" flag to true in Vercel environments
  // because Braintrust calls waitUntil() automatically behind the scenes to
  // ensure your logs are flushed properly.
  asyncFlush: true,
});


export async function POST(req: Request) {
  const { prompt: query } = await req.json();
  const playlist = await handleRequest(query);
  return BraintrustAdapter.toAIStreamResponse(playlist);
}

const handleRequest = wrapTraced(async function handleRequest(query: string) {
  // Parse the URL to get the owner and repo name
  
  return await invoke({
    projectName: PROJECT_NAME,
    slug: PROMPT_SLUG,
    input: {
      query
    },
    stream: true,
  });
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
