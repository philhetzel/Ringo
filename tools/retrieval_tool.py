import braintrust
from pinecone.grpc import PineconeGRPC as Pinecone
from pydantic import BaseModel
from openai import OpenAI
import voyageai
import os
from typing import List

project = braintrust.projects.create("Spotify")
 
 
class Args(BaseModel):
    query: str

class DocumentOutput(BaseModel):
    artist: str
    name: str
    text: str

class DocumentOutputs(BaseModel):
    documents: List[DocumentOutput]
 
def handler(query: str):
    
    #Setup Voyage and Pinecone clients
    vo = voyageai.Client(api_key=os.getenv('VOYAGE_API_KEY'))
    pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
    index = pc.Index("spotify-braintrust-lyrics")

    #Embed query and perform cosine similarity search to Pinecone, then create a dict of results
    xq = vo.embed(query, model="voyage-3", input_type='query').embeddings[0]
    res = index.query(xq, top_k=20, include_metadata=True)
    res = [{"artist": match['metadata']['artist'],"name": match['metadata']['name'], "text": match['metadata']['text'] } for match in res['matches']]
    
    #Grab the text from the results and rerank them using Voyage. Return the top 15 after reranking
    text = [match['text']for match in res]
    reranked_docs = vo.rerank(query, text, model='rerank-2', top_k=15)
    indices = [doc.index for doc in reranked_docs.results ]
    docs = [res[x] for x in indices]
    
    return docs
 


get_documents = project.tools.create(
    handler=handler,
    name="Get Documents",
    slug="get-documents_rerank",
    description="fetch documents from Pinecone based on a user query",
    parameters=Args,
    returns=DocumentOutputs,
    if_exists="replace"
)
 
project.prompts.create(
    model="gpt-4o",
    name="Get related documents from Pinecone",
    slug="get-documents-prompt",
    messages=[
        {
            "role": "system",
            "content": "You are a musical historian. Upon receiving a query, you will generate a list of documents that are related to the query.",
        },
        {
            "role": "user",
            "content": "{{{query}}}",
        },
    ],
    tools=[get_documents],
    if_exists="replace"
)