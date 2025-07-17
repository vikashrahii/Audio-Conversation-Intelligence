"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Conversation {
  id: number;
  audioUrl: string;
  transcriptText?: string;
  createdAt: string;
  analysisJson?: any;
}

export default function DashboardPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [formattedDates, setFormattedDates] = useState<{ [id: number]: string }>({});

  useEffect(() => {
    fetch('http://localhost:3000/conversations')
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
        // Format dates on client
        const dates: { [id: number]: string } = {};
        data.forEach((conv: Conversation) => {
          dates[conv.id] = new Date(conv.createdAt).toLocaleString();
        });
        setFormattedDates(dates);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">Conversations Dashboard</h1>
        {loading ? (
          <div className="text-gray-600 text-center">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="text-gray-600 text-center">No conversations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 text-left font-semibold text-base">ID</th>
                  <th className="p-3 text-left font-semibold text-base">Uploaded</th>
                  <th className="p-3 text-left font-semibold text-base">Transcript</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((conv) => (
                  <tr key={conv.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 font-mono text-blue-700 text-lg">{conv.id}</td>
                    <td className="p-3 text-gray-800 text-base whitespace-nowrap">{formattedDates[conv.id]}</td>
                    <td className="p-3">
                      <Link href={`/transcript/${conv.id}`} className="text-blue-600 hover:underline font-semibold">
                        View Transcript
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 