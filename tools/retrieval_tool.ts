import { VoyageAIClient } from 'voyageai';
import { Pinecone } from '@pinecone-database/pinecone';
import { projects } from 'braintrust';

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
  const vo = new VoyageAIClient({apiKey: process.env.VOYAGE_API_KEY!});
  const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY!});
  const index = pc.Index('spotify-braintrust-lyrics');

  // Embed query and perform cosine similarity search to Pinecone
  const embedding = await vo.embed({
    model: 'voyage-3',
    input: [query],
    inputType: 'query'
  });  
  const xq = embedding.data?.[0]?.embedding as number[];
  
  const queryResponse = await index.query({
    vector: xq,
    topK: 20,
    includeMetadata: true
  });

  const matches = queryResponse.matches;
  console.log(queryResponse.matches)
  
  const res = matches.map(match => ({
    artist: match.metadata.artist,
    name: match.metadata.name,
    text: match.metadata.text
  }));

  // Rerank using Voyage
  const texts = res.map(match => match.text) as string[];
  const reranked = await vo.rerank({
    query: query,
    documents: texts,
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
  slug: 'get-documents-rerank-ts',
  description: 'fetch documents from Pinecone based on a user query in TypeScript',
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


export { handler, DocumentOutput, DocumentOutputs };