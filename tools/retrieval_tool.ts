
import { VoyageAI } from 'voyage-ai';
import { PineconeClient } from '@pinecone-database/pinecone';
import { BraintrustProject } from 'braintrust';

interface Args {
  query: string;
}

interface DocumentOutput {
  artist: string;
  name: string;
  text: string;
}

interface DocumentOutputs {
  documents: DocumentOutput[];
}

interface PineconeMatch {
  metadata: {
    artist: string;
    name: string;
    text: string;
  };
}

async function handler(query: string): Promise<DocumentOutput[]> {
  // Setup Voyage and Pinecone clients
  const vo = new VoyageAI(process.env.VOYAGE_API_KEY!);
  const pc = new PineconeClient();
  await pc.init({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: 'YOUR_ENVIRONMENT' // You'll need to set this
  });
  const index = pc.Index('spotify-braintrust-lyrics');

  // Embed query and perform cosine similarity search to Pinecone
  const embedding = await vo.embed({
    model: 'voyage-3',
    input: [query],
    inputType: 'query'
  });
  const xq = embedding.embeddings[0];

  const queryResponse = await index.query({
    vector: xq,
    topK: 20,
    includeMetadata: true
  });

  const matches = queryResponse.matches as PineconeMatch[];
  const res = matches.map(match => ({
    artist: match.metadata.artist,
    name: match.metadata.name,
    text: match.metadata.text
  }));

  // Rerank using Voyage
  const texts = res.map(match => match.text);
  const reranked = await vo.rerank({
    query,
    texts,
    model: 'rerank-2',
    topK: 15
  });

  const indices = reranked.results.map(doc => doc.index);
  const docs = indices.map(i => res[i]);

  return docs;
}

// Create Braintrust project and tools
const project = new BraintrustProject('Spotify');

const getDocuments = project.tools.create({
  handler,
  name: 'Get Documents',
  slug: 'get-documents_rerank',
  description: 'fetch documents from Pinecone based on a user query',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string' }
    },
    required: ['query']
  },
  returns: {
    type: 'object',
    properties: {
      documents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            artist: { type: 'string' },
            name: { type: 'string' },
            text: { type: 'string' }
          }
        }
      }
    }
  },
  ifExists: 'replace'
});

project.prompts.create({
  model: 'gpt-4',
  name: 'Get related documents from Pinecone',
  slug: 'get-documents-prompt',
  messages: [
    {
      role: 'system',
      content: 'You are a musical historian. Upon receiving a query, you will generate a list of documents that are related to the query.',
    },
    {
      role: 'user',
      content: '{{{query}}}',
    },
  ],
  tools: [getDocuments],
  ifExists: 'replace'
});

export { handler, DocumentOutput, DocumentOutputs };
