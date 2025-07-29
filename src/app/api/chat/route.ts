import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, hasImages, hasFiles } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Get the last message (user's message)
    const lastMessage = messages[messages.length - 1];
    
    // Prepare the content for OpenAI API
    let content: any[] = [];
    
    // Add text content if available
    if (lastMessage.content) {
      content.push({
        type: 'text',
        text: lastMessage.content
      });
    }

    // Handle images (Vision API)
    if (hasImages && lastMessage.images) {
      for (const image of lastMessage.images) {
        content.push({
          type: 'image_url',
          image_url: {
            url: image
          }
        });
      }
    }

    // Handle files
    if (hasFiles && lastMessage.files) {
      let fileContext = '\n\nAttached files:\n';
      for (const file of lastMessage.files) {
        fileContext += `\n--- ${file.name} ---\n`;
        if (file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
          // For text files, include the content directly
          fileContext += file.content;
        } else {
          // For other files (PDF, Word), mention they are attached
          fileContext += `[${file.type} file - content analysis available]`;
        }
        fileContext += '\n';
      }
      
      // Add file context to the text content
      if (content.length > 0 && content[0].type === 'text') {
        content[0].text += fileContext;
      } else {
        content.unshift({
          type: 'text',
          text: fileContext
        });
      }
    }

    // Prepare messages for OpenAI API
    const openaiMessages = [
      {
        role: 'system',
        content: `You are a helpful AI assistant. You can analyze images, read documents, and provide detailed responses. When analyzing images, describe what you see in detail. When working with documents, provide comprehensive analysis and answer questions about their content.`
      },
      // Include previous messages for context (convert to simple text format)
      ...messages.slice(0, -1).map((msg: any) => ({
        role: msg.role,
        content: msg.content || 'Message with attachments'
      })),
      // Add the current message with all content types
      {
        role: 'user',
        content: content.length === 1 && content[0].type === 'text' ? content[0].text : content
      }
    ];

    // Choose the appropriate model based on content type
    const model = hasImages ? 'gpt-4-vision-preview' : 'gpt-4-turbo-preview';

    const completion = await openai.chat.completions.create({
      model: model,
      messages: openaiMessages as any,
      max_tokens: hasImages ? 4096 : 2048,
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    return NextResponse.json({ content: responseContent });
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ 
          error: 'OpenAI API key not configured. Please add your API key to environment variables.' 
        }, { status: 500 });
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json({ 
          error: 'OpenAI API quota exceeded. Please check your OpenAI account.' 
        }, { status: 429 });
      }
    }
    
    return NextResponse.json({ 
      error: 'An error occurred while processing your request. Please try again.' 
    }, { status: 500 });
  }
}