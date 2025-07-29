'use client';

import { useState } from 'react';
import { 
  Database, 
  Brain, 
  Settings, 
  Search, 
  Upload, 
  MessageCircle,
  X,
  Play,
  FileText,
  Zap
} from 'lucide-react';

interface ApiDashboardProps {
  onClose: () => void;
}

export default function ApiDashboard({ onClose }: ApiDashboardProps) {
  const [activeTab, setActiveTab] = useState('embeddings');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Embeddings demo
  const [embeddingText, setEmbeddingText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [documentsToStore, setDocumentsToStore] = useState('');

  // Fine-tuning demo
  const [trainingData, setTrainingData] = useState('');
  const [fineTuningJobs, setFineTuningJobs] = useState<any[]>([]);

  // RAG demo
  const [ragDocuments, setRagDocuments] = useState('');
  const [ragQuery, setRagQuery] = useState('');

  const handleEmbeddingDemo = async (action: string) => {
    setLoading(true);
    setResult(null);

    try {
      let body: any = { action };

      switch (action) {
        case 'embed':
          body.text = embeddingText;
          break;
        case 'store':
          body.texts = documentsToStore.split('\n').filter(t => t.trim());
          break;
        case 'search':
          body.query = searchQuery;
          break;
      }

      const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to process request' });
    } finally {
      setLoading(false);
    }
  };

  const handleFineTuningDemo = async (action: string) => {
    setLoading(true);
    setResult(null);

    try {
      let body: any = { action };

      if (action === 'upload-training-data') {
        // Parse training data from textarea
        const lines = trainingData.split('\n').filter(line => line.trim());
        const parsedData = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);
        
        body.trainingData = parsedData;
      }

      const response = await fetch('/api/fine-tuning', {
        method: action === 'list-jobs' ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'list-jobs' ? undefined : JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);
      
      if (action === 'list-jobs') {
        setFineTuningJobs(data.jobs || []);
      }
    } catch (error) {
      setResult({ error: 'Failed to process request' });
    } finally {
      setLoading(false);
    }
  };

  const handleRagDemo = async (action: string) => {
    setLoading(true);
    setResult(null);

    try {
      let body: any = { action };

      switch (action) {
        case 'upload-documents':
          const docs = ragDocuments.split('---').map((doc, index) => ({
            filename: `document_${index + 1}.txt`,
            content: doc.trim()
          })).filter(doc => doc.content);
          body.documents = docs;
          break;
        case 'query':
          body.query = ragQuery;
          break;
      }

      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to process request' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'embeddings', label: 'Embeddings API', icon: Database },
    { id: 'fine-tuning', label: 'Fine-tuning API', icon: Settings },
    { id: 'rag', label: 'RAG System', icon: Brain },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            OpenAI API Demo Dashboard
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">API Features</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'embeddings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      OpenAI Embeddings API Demo
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Test text embeddings, document storage, and semantic search functionality.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create Embedding */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Create Embedding</h4>
                      <textarea
                        value={embeddingText}
                        onChange={(e) => setEmbeddingText(e.target.value)}
                        placeholder="Enter text to create embedding..."
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        rows={3}
                      />
                      <button
                        onClick={() => handleEmbeddingDemo('embed')}
                        disabled={loading || !embeddingText.trim()}
                        className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                      >
                        <Zap size={16} />
                        <span>Create Embedding</span>
                      </button>
                    </div>

                    {/* Store Documents */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Store Documents</h4>
                      <textarea
                        value={documentsToStore}
                        onChange={(e) => setDocumentsToStore(e.target.value)}
                        placeholder="Enter documents (one per line)..."
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        rows={3}
                      />
                      <button
                        onClick={() => handleEmbeddingDemo('store')}
                        disabled={loading || !documentsToStore.trim()}
                        className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                      >
                        <Upload size={16} />
                        <span>Store Documents</span>
                      </button>
                    </div>

                    {/* Search */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg md:col-span-2">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Semantic Search</h4>
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Enter search query..."
                          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleEmbeddingDemo('search')}
                          disabled={loading || !searchQuery.trim()}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                          <Search size={16} />
                          <span>Search</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fine-tuning' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      OpenAI Fine-tuning API Demo
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Upload training data and manage fine-tuning jobs. Training data should be in JSONL format.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Training Data */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Training Data (JSONL)</h4>
                      <textarea
                        value={trainingData}
                        onChange={(e) => setTrainingData(e.target.value)}
                        placeholder={`{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "Hello!"}, {"role": "assistant", "content": "Hi there!"}]}\n{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "How are you?"}, {"role": "assistant", "content": "I'm doing great!"}]}`}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                        rows={6}
                      />
                      <div className="flex space-x-3 mt-3">
                        <button
                          onClick={() => handleFineTuningDemo('upload-training-data')}
                          disabled={loading || !trainingData.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                          <Upload size={16} />
                          <span>Upload Training Data</span>
                        </button>
                        <button
                          onClick={() => handleFineTuningDemo('list-jobs')}
                          disabled={loading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                          <FileText size={16} />
                          <span>List Jobs</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rag' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      RAG System Demo
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Upload documents and ask questions about them. Separate multiple documents with "---".
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Upload Documents */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Upload Documents</h4>
                      <textarea
                        value={ragDocuments}
                        onChange={(e) => setRagDocuments(e.target.value)}
                        placeholder={`Document 1 content here...\n---\nDocument 2 content here...\n---\nDocument 3 content here...`}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        rows={6}
                      />
                      <button
                        onClick={() => handleRagDemo('upload-documents')}
                        disabled={loading || !ragDocuments.trim()}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        <Upload size={16} />
                        <span>Upload Documents</span>
                      </button>
                    </div>

                    {/* Query Documents */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Ask Questions</h4>
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={ragQuery}
                          onChange={(e) => setRagQuery(e.target.value)}
                          placeholder="Ask a question about your documents..."
                          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleRagDemo('query')}
                          disabled={loading || !ragQuery.trim()}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                          <MessageCircle size={16} />
                          <span>Ask</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="mt-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Result</h4>
                  <pre className="bg-white dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto max-h-96 text-gray-900 dark:text-white">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="mt-6 flex items-center justify-center p-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}