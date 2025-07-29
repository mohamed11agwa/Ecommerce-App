'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Image, Paperclip, Mic, Settings, Plus, Clock } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import MessageList from './MessageList';
import FileUpload from './FileUpload';
import ReminderAgent from './ReminderAgent';
import ApiDashboard from './ApiDashboard';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: string[];
  files?: { name: string; type: string; content: string }[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showApiDashboard, setShowApiDashboard] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; content: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            setUploadedImages(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        } else {
          // Handle document files
          const reader = new FileReader();
          reader.onload = () => {
            setUploadedFiles(prev => [...prev, {
              name: file.name,
              type: file.type,
              content: reader.result as string
            }]);
          };
          reader.readAsText(file);
        }
      });
    }
  });

  const sendMessage = async () => {
    if (!input.trim() && uploadedImages.length === 0 && uploadedFiles.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setUploadedImages([]);
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          hasImages: uploadedImages.length > 0,
          hasFiles: uploadedFiles.length > 0
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">ChatGPT Clone</h1>
          <button
            onClick={() => setMessages([])}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowReminder(!showReminder)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="AI Reminder Agent"
          >
            <Clock size={20} />
          </button>
          <button
            onClick={() => setShowApiDashboard(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="API Demo Dashboard"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Reminder Agent */}
      {showReminder && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <ReminderAgent onClose={() => setShowReminder(false)} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onClose={() => setShowFileUpload(false)}
          onFilesUploaded={(files) => {
            setUploadedFiles(prev => [...prev, ...files]);
            setShowFileUpload(false);
          }}
        />
      )}

      {/* API Dashboard */}
      {showApiDashboard && (
        <ApiDashboard onClose={() => setShowApiDashboard(false)} />
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <Paperclip size={16} />
                  <span className="text-sm truncate max-w-32">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div {...getRootProps()} className={`p-4 ${isDragActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
          <input {...getInputProps()} />
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isDragActive ? "Drop files here..." : "Message ChatGPT..."}
                className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] max-h-32"
                rows={1}
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Upload Image"
                >
                  <Image size={18} />
                </button>
                <button
                  onClick={() => setShowFileUpload(true)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Upload Document"
                >
                  <Paperclip size={18} />
                </button>
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && uploadedImages.length === 0 && uploadedFiles.length === 0)}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input for images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
              setUploadedImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
          });
          e.target.value = '';
        }}
      />
    </div>
  );
}