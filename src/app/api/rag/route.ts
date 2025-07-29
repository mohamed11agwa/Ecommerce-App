import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple document store for RAG (in production, use a proper vector database)
const documentStore = new Map<string, {
  content: string;
  embedding: number[];
  metadata: {
    filename: string;
    uploadedAt: string;
    chunks: number;
  };
}>();

// Helper function to split text into chunks
function splitTextIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    
    if (start >= text.length) break;
  }
  
  return chunks;
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

export async function POST(request: NextRequest) {
  try {
    const { action, documents, query, filename } = await request.json();
    
    switch (action) {
      case 'upload-documents':
        return await handleUploadDocuments(documents);
      case 'query':
        return await handleQuery(query);
      case 'delete-document':
        return await handleDeleteDocument(filename);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json({ 
      error: 'An error occurred while processing RAG request' 
    }, { status: 500 });
  }
}

async function handleUploadDocuments(documents: { filename: string; content: string }[]) {
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return NextResponse.json({ 
      error: 'Documents array is required' 
    }, { status: 400 });
  }

  try {
    const processedDocuments = [];
    
    for (const doc of documents) {
      if (!doc.filename || !doc.content) {
        continue;
      }
      
      // Split document into chunks
      const chunks = splitTextIntoChunks(doc.content);
      
      // Create embeddings for each chunk
      const embeddings = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks,
        encoding_format: 'float',
      });
      
      // Store each chunk with its embedding
      for (let i = 0; i < chunks.length; i++) {
        const chunkId = `${doc.filename}_chunk_${i}`;
        documentStore.set(chunkId, {
          content: chunks[i],
          embedding: embeddings.data[i].embedding,
          metadata: {
            filename: doc.filename,
            uploadedAt: new Date().toISOString(),
            chunks: chunks.length
          }
        });
      }
      
      processedDocuments.push({
        filename: doc.filename,
        chunks: chunks.length,
        totalCharacters: doc.content.length
      });
    }
    
    return NextResponse.json({
      message: `Successfully processed ${documents.length} documents`,
      documents: processedDocuments,
      totalChunks: Array.from(documentStore.keys()).length
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    return NextResponse.json({ 
      error: 'Failed to upload documents' 
    }, { status: 500 });
  }
}

async function handleQuery(query: string) {
  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  if (documentStore.size === 0) {
    return NextResponse.json({ 
      error: 'No documents uploaded yet. Please upload documents first.',
      answer: 'I don\'t have any documents to search through. Please upload some documents first.'
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
    
    // Find most relevant chunks
    const similarities = [];
    
    for (const [chunkId, doc] of documentStore.entries()) {
      const similarity = cosineSimilarity(queryVector, doc.embedding);
      similarities.push({
        chunkId,
        content: doc.content,
        similarity,
        filename: doc.metadata.filename
      });
    }
    
    // Get top 5 most relevant chunks
    const relevantChunks = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
    
    // Create context from relevant chunks
    const context = relevantChunks
      .map(chunk => `[From ${chunk.filename}]: ${chunk.content}`)
      .join('\n\n');
    
    // Generate answer using GPT with the retrieved context
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that answers questions based on the provided context. Use the context to answer the user's question accurately. If the context doesn't contain enough information to answer the question, say so clearly. Always cite which document(s) you're referencing in your answer.`
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${query}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const answer = completion.choices[0]?.message?.content || 'No answer generated';
    
    return NextResponse.json({
      query,
      answer,
      sources: relevantChunks.map(chunk => ({
        filename: chunk.filename,
        similarity: chunk.similarity,
        excerpt: chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : '')
      })),
      totalDocuments: new Set(Array.from(documentStore.values()).map(doc => doc.metadata.filename)).size
    });
  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json({ 
      error: 'Failed to process query' 
    }, { status: 500 });
  }
}

async function handleDeleteDocument(filename: string) {
  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    let deletedChunks = 0;
    
    // Delete all chunks for this document
    for (const [chunkId, doc] of documentStore.entries()) {
      if (doc.metadata.filename === filename) {
        documentStore.delete(chunkId);
        deletedChunks++;
      }
    }
    
    if (deletedChunks === 0) {
      return NextResponse.json({ 
        error: 'Document not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      message: `Successfully deleted ${filename}`,
      deletedChunks,
      remainingDocuments: new Set(Array.from(documentStore.values()).map(doc => doc.metadata.filename)).size
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ 
      error: 'Failed to delete document' 
    }, { status: 500 });
  }
}

// GET endpoint to list uploaded documents
export async function GET(request: NextRequest) {
  try {
    const documents = new Map<string, { chunks: number; uploadedAt: string; totalSize: number }>();
    
    // Aggregate document information
    for (const doc of documentStore.values()) {
      const filename = doc.metadata.filename;
      if (documents.has(filename)) {
        const existing = documents.get(filename)!;
        documents.set(filename, {
          ...existing,
          chunks: existing.chunks + 1,
          totalSize: existing.totalSize + doc.content.length
        });
      } else {
        documents.set(filename, {
          chunks: 1,
          uploadedAt: doc.metadata.uploadedAt,
          totalSize: doc.content.length
        });
      }
    }
    
    const documentList = Array.from(documents.entries()).map(([filename, info]) => ({
      filename,
      chunks: info.chunks,
      uploadedAt: info.uploadedAt,
      totalSize: info.totalSize
    }));
    
    return NextResponse.json({
      documents: documentList,
      totalDocuments: documentList.length,
      totalChunks: documentStore.size
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch documents' 
    }, { status: 500 });
  }
}

// DELETE endpoint to clear all documents
export async function DELETE(request: NextRequest) {
  try {
    const totalDeleted = documentStore.size;
    documentStore.clear();
    
    return NextResponse.json({
      message: 'All documents cleared successfully',
      deletedChunks: totalDeleted
    });
  } catch (error) {
    console.error('Error clearing documents:', error);
    return NextResponse.json({ 
      error: 'Failed to clear documents' 
    }, { status: 500 });
  }
}