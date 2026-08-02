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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800">Loading Your Lectures...</h3>
        <p className="text-xs text-slate-400 mt-1">Retrieving processed video knowledge graphs</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-2">My Ingested Lectures</h1>
      <p className="text-sm text-slate-500 mb-6">
        {videos.length} lecture{videos.length !== 1 ? 's' : ''} processed
      </p>
      
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No lectures yet</h3>
          <p className="text-sm text-slate-500">Ingest a YouTube video to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {videos.map((vid) => (
            <div key={vid.video_id} className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-0 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="w-full h-44 sm:w-44 sm:h-28 flex-shrink-0 bg-slate-100 overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${vid.video_id}/hqdefault.jpg`}
                  alt={vid.title || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 p-5 flex flex-col justify-between min-h-[112px]">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
                    {vid.title || `Video ID: ${vid.video_id}`}
                  </h3>
                  <a
                    href={`https://youtube.com/watch?v=${vid.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline font-mono"
                  >
                    youtube.com/watch?v={vid.video_id}
                  </a>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100 mt-3">
                    <button
                      onClick={() => onSelectGraph(vid.video_id)}
                      className="flex-1 py-2 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all duration-200 rounded-lg text-xs font-semibold"
                    >
                      📊 Knowledge Graph
                    </button>
                    <button
                      onClick={() => onSelectQuiz(vid.video_id)}
                      className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all duration-200 rounded-lg text-xs font-semibold transition-all"
                    >
                      📝 Adaptive Quiz
                    </button>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
