'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onClose: () => void;
  onFilesUploaded: (files: { name: string; type: string; content: string }[]) => void;
}

export default function FileUpload({ onClose, onFilesUploaded }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; content: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File): Promise<{ name: string; type: string; content: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          let content = '';
          
          if (file.type === 'application/pdf') {
            // For PDF files, we'll need to implement PDF parsing
            // For now, we'll just store the base64 content
            content = reader.result as string;
          } else if (file.type.includes('text') || file.name.endsWith('.md')) {
            content = reader.result as string;
          } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
            // For Word documents, we'll need to implement document parsing
            // For now, we'll just store the base64 content
            content = reader.result as string;
          } else {
            content = reader.result as string;
          }
          
          resolve({
            name: file.name,
            type: file.type,
            content: content
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      
      if (file.type === 'application/pdf' || file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/json': ['.json'],
      'text/csv': ['.csv']
    },
    onDrop: async (acceptedFiles) => {
      setIsProcessing(true);
      setError(null);
      
      try {
        const processedFiles = await Promise.all(
          acceptedFiles.map(file => processFile(file))
        );
        
        setUploadedFiles(prev => [...prev, ...processedFiles]);
      } catch (error) {
        setError('Error processing files. Please try again.');
        console.error('File processing error:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    onDropRejected: (fileRejections) => {
      const rejectedTypes = fileRejections.map(rejection => 
        rejection.file.type || rejection.file.name.split('.').pop()
      ).join(', ');
      setError(`Unsupported file types: ${rejectedTypes}. Please upload text, PDF, or Word documents.`);
    }
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Documents</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          </div>
        )}

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isDragActive ? 'Drop files here' : 'Upload Documents'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Supported formats: TXT, MD, PDF, DOC, DOCX, JSON, CSV
          </p>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {file.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Processing files...</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploadedFiles.length === 0 || isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}