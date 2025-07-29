import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory vector store (in production, use a proper vector database)
const vectorStore = new Map<string, { text: string; embedding: number[]; metadata?: any }>();

export async function POST(request: NextRequest) {
  try {
    const { action, text, query, texts } = await request.json();
    
    switch (action) {
      case 'embed':
        return await handleEmbed(text);
      case 'store':
        return await handleStore(texts);
      case 'search':
        return await handleSearch(query);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Embeddings API error:', error);
    return NextResponse.json({ 
      error: 'An error occurred while processing embeddings request' 
    }, { status: 500 });
  }
}

async function handleEmbed(text: string) {
  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    const embedding = response.data[0].embedding;
    
    return NextResponse.json({
      text,
      embedding,
      dimensions: embedding.length,
      model: 'text-embedding-3-small'
    });
  } catch (error) {
    console.error('Error creating embedding:', error);
    return NextResponse.json({ error: 'Failed to create embedding' }, { status: 500 });
  }
}

async function handleStore(texts: string[]) {
  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return NextResponse.json({ error: 'Texts array is required' }, { status: 400 });
  }

  try {
    const embeddings = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      encoding_format: 'float',
    });

    const storedItems = [];
    
    for (let i = 0; i < texts.length; i++) {
      const id = `doc_${Date.now()}_${i}`;
      const embedding = embeddings.data[i].embedding;
      
      vectorStore.set(id, {
        text: texts[i],
        embedding: embedding,
        metadata: {
          createdAt: new Date().toISOString(),
          index: i
        }
      });
      
      storedItems.push({
        id,
        text: texts[i],
        dimensions: embedding.length
      });
    }
    
    return NextResponse.json({
      message: `Successfully stored ${texts.length} text embeddings`,
      items: storedItems,
      totalStored: vectorStore.size
    });
  } catch (error) {
    console.error('Error storing embeddings:', error);
    return NextResponse.json({ error: 'Failed to store embeddings' }, { status: 500 });
  }
}

async function handleSearch(query: string) {
  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  if (vectorStore.size === 0) {
    return NextResponse.json({ 
      message: 'No documents stored yet. Use the store action first.',
      results: []
    });
  }

  try {
    // Create embedding for the query
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float',
    });

    const queryVector = queryEmbedding.data[0].embedding;
    
    // Calculate cosine similarity with all stored embeddings
    const similarities = [];
    
    for (const [id, doc] of vectorStore.entries()) {
      const similarity = cosineSimilarity(queryVector, doc.embedding);
      similarities.push({
        id,
        text: doc.text,
        similarity,
        metadata: doc.metadata
      });
    }
    
    // Sort by similarity (highest first) and return top results
    const results = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Return top 5 results
    
    return NextResponse.json({
      query,
      results,
      totalDocuments: vectorStore.size
    });
  } catch (error) {
    console.error('Error searching embeddings:', error);
    return NextResponse.json({ error: 'Failed to search embeddings' }, { status: 500 });
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

// GET endpoint to list stored documents
export async function GET(request: NextRequest) {
  try {
    const documents = Array.from(vectorStore.entries()).map(([id, doc]) => ({
      id,
      text: doc.text.substring(0, 100) + (doc.text.length > 100 ? '...' : ''),
      metadata: doc.metadata,
      dimensions: doc.embedding.length
    }));
    
    return NextResponse.json({
      totalDocuments: vectorStore.size,
      documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// DELETE endpoint to clear the vector store
export async function DELETE(request: NextRequest) {
  try {
    const { documentId } = await request.json();
    
    if (documentId) {
      // Delete specific document
      if (vectorStore.has(documentId)) {
        vectorStore.delete(documentId);
        return NextResponse.json({ message: 'Document deleted successfully' });
      } else {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
    } else {
      // Clear all documents
      vectorStore.clear();
      return NextResponse.json({ message: 'All documents cleared successfully' });
    }
  } catch (error) {
    console.error('Error deleting documents:', error);
    return NextResponse.json({ error: 'Failed to delete documents' }, { status: 500 });
  }
}