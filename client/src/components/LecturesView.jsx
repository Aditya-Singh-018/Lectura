// client/src/components/LecturesView.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function LecturesView({ onSelectGraph, onSelectQuiz }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch("/api/videos", {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (err) {
        console.error("Failed to load lectures:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 text-sm">Loading your lectures...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-bold text-white mb-6">My Ingested Lectures</h1>
      
      {videos.length === 0 ? (
        <p className="text-slate-400 text-sm">No processed videos found yet. Ingest a video first!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((vid) => (
            <div key={vid.video_id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">{vid.title || `Video ID: ${vid.video_id}`}</h3>
                <p className="text-xs text-slate-400 font-mono mb-4">ID: {vid.video_id}</p>
              </div>
              
              {/* Dual Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectGraph(vid.video_id)}
                  className="flex-1 py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
                >
                  📊 Knowledge Graph
                </button>
                <button
                  onClick={() => onSelectQuiz(vid.video_id)}
                  className="flex-1 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
                >
                  📝 Adaptive Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
