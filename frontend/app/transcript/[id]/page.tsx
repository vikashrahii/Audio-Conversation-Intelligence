"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Conversation {
  id: number;
  audioUrl: string;
  transcriptText?: string;
  createdAt: string;
  analysisJson?: any;
}

interface Analysis {
  speakerRoles?: string[];
  talkRatio?: string;
  questionsAsked?: number;
  objectionsRaised?: number;
  sentiment?: any;
  summary?: string;
  entities?: any;
  chapters?: any;
}

export default function TranscriptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedAt, setUploadedAt] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3000/conversations`)
      .then((res) => res.json())
      .then((data: Conversation[]) => {
        const found = data.find((c) => c.id === Number(id));
        setConversation(found || null);
        if (found && found.analysisJson) setAnalysis(found.analysisJson);
        setLoading(false);
        if (found?.createdAt) {
          setUploadedAt(new Date(found.createdAt).toLocaleString());
        }
      });
  }, [id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    const res = await fetch('http://localhost:3000/conversations/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: Number(id) }),
    });
    const data = await res.json();
    if (data.analysis) {
      setAnalysis(data.analysis);
    } else {
      setError(data.error || 'Analysis failed');
    }
    setAnalyzing(false);
  };

  const handleTranscribe = async () => {
    setTranscribing(true);
    setError(null);
    const res = await fetch('http://localhost:3000/conversations/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: Number(id) }),
    });
    const data = await res.json();
    if (data.transcriptText) {
      setConversation((prev) => prev ? { ...prev, transcriptText: data.transcriptText } : prev);
      await handleAnalyze();
    } else {
      setError(data.error || 'Transcription failed');
    }
    setTranscribing(false);
  };

  // Download transcript as TXT
  const handleDownloadTranscript = () => {
    if (!conversation?.transcriptText) return;
    const blob = new Blob([conversation.transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_conversation_${conversation.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download AI insights as JSON
  const handleDownloadInsights = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_insights_conversation_${conversation?.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!conversation) return <div className="p-8 text-red-600">Conversation not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8 border border-gray-200 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-gray-900">Transcript for Conversation #{conversation.id}</h1>
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={handleDownloadTranscript}
            disabled={!conversation.transcriptText}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            Download Transcript (.txt)
          </button>
          <button
            onClick={handleDownloadInsights}
            disabled={!analysis}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            Download AI Insights (.json)
          </button>
        </div>
        <div className="mb-2 text-gray-700 font-medium">Uploaded: {uploadedAt}</div>
        {conversation.transcriptText ? (
          <div className="whitespace-pre-wrap bg-gray-100 p-4 rounded mb-4 text-gray-800 border border-gray-200">
            {conversation.transcriptText}
          </div>
        ) : (
          <div className="mb-4 text-yellow-600 font-semibold">No transcript available.</div>
        )}
        {!conversation.transcriptText && (
          <button
            onClick={handleTranscribe}
            disabled={transcribing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {transcribing ? 'Transcribing...' : 'Transcribe Audio'}
          </button>
        )}
        {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}
      </div>
      {/* AI Insights Section */}
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
        <h2 className="text-xl md:text-2xl font-extrabold mb-4 text-gray-900">AI Insights</h2>
        {analyzing && <div className="mb-4 text-blue-600 font-semibold">Analyzing...</div>}
        {analysis ? (
          <div className="space-y-4">
            {analysis.summary && (
              <div>
                <span className="font-bold text-lg text-gray-900">Summary:</span>
                <div className="mt-1 text-gray-800">{analysis.summary}</div>
              </div>
            )}
            {/* Sentiment Section - per section/sentence */}
            <div>
              <span className="font-bold text-lg text-gray-900">Sentiment by Section:</span>
              {analysis.sentiment && typeof analysis.sentiment === 'object' && Object.keys(analysis.sentiment).length > 0 ? (
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  {Array.isArray(analysis.sentiment)
                    ? analysis.sentiment.map((s: any, i: number) => (
                        <li key={i} className="text-gray-800">
                          <span className="font-semibold">{s.section || s.sentence || `Section ${i+1}`}:</span>{' '}
                          <span
                            className={
                              s.sentiment === 'POSITIVE'
                                ? 'font-bold text-green-600'
                                : s.sentiment === 'NEGATIVE'
                                ? 'font-bold text-red-600'
                                : s.sentiment === 'NEUTRAL'
                                ? 'font-bold text-blue-600'
                                : 'font-bold text-gray-600'
                            }
                          >
                            {s.sentiment}
                          </span>
                        </li>
                      ))
                    : Object.entries(analysis.sentiment).map(([section, value]) => (
                        <li key={section} className="text-gray-800">
                          <span className="font-semibold">{section}:</span>{' '}
                          <span
                            className={
                              value === 'POSITIVE'
                                ? 'font-bold text-green-600'
                                : value === 'NEGATIVE'
                                ? 'font-bold text-red-600'
                                : value === 'NEUTRAL'
                                ? 'font-bold text-blue-600'
                                : 'font-bold text-gray-600'
                            }
                          >
                            {String(value)}
                          </span>
                        </li>
                      ))}
                </ul>
              ) : (
                <div className="text-gray-600">No sentiment detected.</div>
              )}
            </div>
            {/* End Sentiment Section */}
            {/* Entities Section */}
            {analysis.entities && Array.isArray(analysis.entities) && analysis.entities.length > 0 && (
              <div>
                <span className="font-bold text-lg text-gray-900">Entities:</span>
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  {analysis.entities.map((e: any, i: number) => (
                    <li key={i} className="text-gray-800">
                      <span className="font-semibold">{e.entity_type || e.type || 'Entity'}:</span> {e.text || e.name || e.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Speaker Roles and Talk Ratio */}
            {(analysis.speakerRoles || analysis.talkRatio) && (
              <div>
                {analysis.speakerRoles && (
                  <div>
                    <span className="font-bold text-lg text-gray-900">Speaker Roles:</span>
                    <pre className="bg-gray-100 rounded p-2 mt-1 text-gray-800">{JSON.stringify(analysis.speakerRoles, null, 2)}</pre>
                  </div>
                )}
                {analysis.talkRatio && (
                  <div>
                    <span className="font-bold text-lg text-gray-900">Talk Ratio:</span>
                    <pre className="bg-gray-100 rounded p-2 mt-1 text-gray-800">{JSON.stringify(analysis.talkRatio, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4 text-yellow-600 font-semibold">No analysis available.</div>
        )}
      </div>
    </div>
  );
} 