import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from '@dagrejs/dagre';
import { supabase } from '../supabaseClient';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;

function getLayoutedElements(concepts, rawEdges, direction = 'TB') {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100 });

  concepts.forEach(c => g.setNode(String(c.id), { width: NODE_WIDTH, height: NODE_HEIGHT }));
  rawEdges.forEach(e => g.setEdge(String(e.source_concept_id), String(e.target_concept_id)));

  dagre.layout(g);

  const nodes = concepts.map(c => {
    const pos = g.node(String(c.id));
    return {
      id: String(c.id),
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: { label: c.name, description: c.description, tier: c.sort_order || 0, direction },
      type: 'conceptNode',
    };
  });

  const edges = rawEdges.map(e => ({
    id: `${e.source_concept_id}-${e.target_concept_id}`,
    source: String(e.source_concept_id),
    target: String(e.target_concept_id),
    type: 'smoothstep',
    style: { stroke: '#6366f1', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
  }));

  return { nodes, edges };
}

function ConceptNode({ data, selected }) {
  const isVertical = data.direction === 'TB';

  return (
    <div className={`px-3 py-2.5 bg-white border-2 rounded-xl shadow-sm cursor-pointer transition-all duration-200 w-[180px]
      ${selected ? 'border-indigo-500 shadow-indigo-200 shadow-md' : 'border-slate-200 hover:border-blue-400'}`}>

      {/* Incoming connections — prerequisites */}
      <Handle
        type="target"
        position={isVertical ? Position.Top : Position.Left}
        style={{ background: '#6366f1', width: 8, height: 8, border: '2px solid white' }}
      />

      <p className="text-xs font-semibold text-slate-900 leading-snug">{data.label}</p>
      <span className="text-[10px] text-indigo-400 font-medium mt-0.5 block">Tier {data.tier + 1}</span>

      {/* Outgoing connections — unlocks */}
      <Handle
        type="source"
        position={isVertical ? Position.Bottom : Position.Right}
        style={{ background: '#6366f1', width: 8, height: 8, border: '2px solid white' }}
      />

    </div>
  );
}

const nodeTypes = { conceptNode: ConceptNode };

export default function KnowledgeGraphDashboard({ videoId: initialVideoId = null, onStartQuiz, onNavigate }) {
  // State elements
  const [videos, setVideos] = useState([]);
  const [activeVideoId, setActiveVideoId] = useState(initialVideoId); // seeded from prop
  const [graphData, setGraphData] = useState({ concepts: [], edges: [] });
  const [direction, setDirection] = useState(() => 
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'LR' : 'TB'
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setDirection(window.innerWidth < 640 ? 'LR' : 'TB');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(()=>{
    async function fetchUserVideos(){
      try{
        // Bug Fix #1: All backend routes use reqAuth middleware → must send Bearer token
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch("/api/videos", {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const data = await res.json();
        if(data.videos){
          setVideos(data.videos);
        }
      }catch(error){
        console.error("Failed to fetch the videos data",error);
      }
    }
    fetchUserVideos();
  },[]);

  useEffect(()=>{
    async function fetchGraphData(){
      setLoading(true);
      try{
        // Bug Fix #1: send auth header — backend requires Bearer token on all /api/graph routes
        const { data: { session } } = await supabase.auth.getSession();
        const endpoint = activeVideoId
          ? `/api/graph/video/${activeVideoId}`
          : `/api/graph`;

        const res = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const data = await res.json();
        setGraphData({
          concepts: data.concepts || [],
          edges: data.edges || []
        });
      }catch(error){
        console.error("Failed to fetch graph data ",error);
      }finally{
        // Bug Fix #2: setLoading(false) was missing — spinner never cleared after data arrived
        setLoading(false);
      }
    }
    fetchGraphData();
  },[activeVideoId]);

const { nodes, edges: flowEdges } = useMemo(() => {
  if (!graphData.concepts.length) return { nodes: [], edges: [] };
  return getLayoutedElements(graphData.concepts, graphData.edges, direction);
}, [graphData, direction]);

const activeVideoTitle = videos.find(v => v.video_id === activeVideoId)?.title || null;

return (
    <div className="flex flex-col w-full bg-slate-50 font-sans" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ── TOP HEADER BAR ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm z-10 flex-shrink-0">
        {/* Left: Title + stats */}
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {activeVideoTitle ? activeVideoTitle : 'Global Knowledge Graph'}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {nodes.length} concepts &bull; {flowEdges.length} connections
          </p>
        </div>
        {/* Center: Video scope switcher */}
        <select
          value={activeVideoId || ''}
          onChange={(e) => setActiveVideoId(e.target.value || null)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">🌐 Global Master Tree</option>
          {videos.map(vid => (
            <option key={vid.video_id} value={vid.video_id}>
              🎬 {vid.title || vid.video_id}
            </option>
          ))}
        </select>
        {/* Right: Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('lectures')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            ← My Lectures
          </button>
          <button
            onClick={onStartQuiz}
            disabled={!activeVideoId}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors duration-200 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            📝 Start Quiz
          </button>
        </div>
      </div>
      {/* ── REACT FLOW GRAPH CANVAS ─────────────────────────────────────────── */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <h3 className="text-base font-bold text-slate-800">Building Knowledge Graph...</h3>
            <p className="text-xs text-slate-400">Synthesizing prerequisites and target concepts</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="text-5xl">🧠</div>
            <h3 className="text-base font-semibold text-slate-700">No concepts yet</h3>
            <p className="text-sm text-slate-400">Select a video or ingest one to build its graph.</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2, minZoom: 0.65, maxZoom: 1 }}
            minZoom={0.25}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#cbd5e1" gap={24} size={1} />
            <Controls />
            <MiniMap
              nodeColor={() => '#6366f1'}
              maskColor="rgba(248,250,252,0.75)"
              style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
