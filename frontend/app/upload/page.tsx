"use client";

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('http://localhost:3000/conversations/upload-audio', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setResult(data);
    setConversationId(data.id);
    setUploading(false);
    setProgress(100);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-4 text-gray-900 text-center">Upload Audio</h1>
        <div
          className={`mb-4 flex flex-col items-center w-full border-2 border-dashed rounded-lg p-6 transition cursor-pointer ${file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-blue-50'}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div className="flex flex-col items-center">
              <span className="text-blue-700 font-semibold text-lg mb-1">{file.name}</span>
              <span className="text-gray-500 text-sm">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          ) : (
            <div className="text-gray-600 text-center">
              Drag & drop audio file here, or <span className="text-blue-700 underline">click to select</span>
            </div>
          )}
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded h-2 mt-4">
            <div
              className="bg-blue-500 h-2 rounded transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        {result && (
          <div className="mt-4 text-green-700 font-medium text-center">
            Uploaded! Conversation ID: {result.id}
          </div>
        )}
      </div>
    </div>
  );
} 