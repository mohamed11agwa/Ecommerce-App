'use client';

import { useEffect, useRef } from 'react';
import { Message } from './ChatInterface';
import { User, Bot, Paperclip } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Bot size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to ChatGPT Clone
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Start a conversation, upload images for vision analysis, attach documents, or set up reminders.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`flex max-w-[80%] ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white ml-3'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-3'
              }`}
            >
              {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Message Content */}
            <div
              className={`rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              {/* Images */}
              {message.images && message.images.length > 0 && (
                <div className="mb-2 grid grid-cols-2 gap-2">
                  {message.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Uploaded image ${index + 1}`}
                      className="rounded-lg max-w-full h-auto"
                      style={{ maxHeight: '200px' }}
                    />
                  ))}
                </div>
              )}

              {/* Files */}
              {message.files && message.files.length > 0 && (
                <div className="mb-2 space-y-1">
                  {message.files.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 p-2 rounded ${
                        message.role === 'user'
                          ? 'bg-blue-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <Paperclip size={14} />
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Content */}
              {message.content && (
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-xs mt-1 ${
                  message.role === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-3 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}