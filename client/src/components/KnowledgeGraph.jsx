import React, { useState, useEffect, useRef, useMemo } from 'react';
import { groupIntoConnectedComponents } from '../utils/graphCluster.js';


export default function KnowledgeGraphDashboard() {
  // State elements
  const [videos, setVideos] = useState([]);
  const [activeVideoId, setActiveVideoId] = useState(null); // default to Global view
  const [graphData, setGraphData] = useState({ concepts: [], edges: [] });
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [edgesWithCoordinates, setEdgesWithCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const nodeRefs = useRef({});

  useEffect(()=>{
    async function fetchUserVideos(){
      try{
        const res = await fetch("api/videos");
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
        const endpoint = activeVideoId?
        `api/graph/video/${activeVideoId}`:`api/graph`;

        const res = await fetch(endpoint);
        const data = await res.json();
        setGraphData({
          concepts:data.concepts || [],
          edges:data.edges || []
        });
      }catch(error){
        console.error("Failed to fetch graph data ",error);
      }
    }
    fetchGraphData();
  },[activeVideoId]);

  const clusters = useMemo(() => {  //this memoizes the result of a calculation bw component re-renders
    return groupIntoConnectedComponents(graphData.concepts, graphData.edges);
  }, [graphData]);


  // TODO: Insert SVG Arrow Coordinate Engine here (Milestone 3)

  

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* 1. LEFT SIDEBAR: Video History Navigator */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white tracking-wide">Lectura Dashboard</h2>
          <p className="text-[11px] text-slate-400">Select an isolation scope</p>
        </div>
        
        <div className="p-3 flex flex-col gap-1 overflow-y-auto flex-1">
          {/* Global Toggle Button */}
          <button
            onClick={() => setActiveVideoId(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeVideoId === null 
                ? 'bg-indigo-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            🌐 Global Master Tree
          </button>

          <div className="my-2 border-t border-slate-800/80 my-3"></div>
          
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-1">
            Processed Videos
          </span>
          
          {/* Placeholder for mapping your videos list */}
          {videos.map((vid) => (
            <button
              key={vid.video_id}
              onClick={() => setActiveVideoId(vid.video_id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate block ${
                activeVideoId === vid.video_id
                  ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              🎬 {vid.title || `Video ID: ${vid.video_id}`}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CENTER PANEL: Graph Canvas Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Graph Header */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800 backdrop-blur z-10 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest block">View Target</span>
            <h3 className="text-sm font-semibold text-white">
              {activeVideoId === null ? 'All Connected Knowledge Fields' : `Video Workspace Scope`}
            </h3>
          </div>
        </div>

        {/* Dynamic Concept Node viewport */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-8 select-none">
          {loading ? (
            <div className="text-slate-500 text-xs italic p-4">Loading knowledge matrix...</div>
          ) : clusters.length === 0 ? (
            <div className="text-slate-500 text-xs italic p-4">No concepts available for this view.</div>
          ) : (
            /* 3. REPLACED PLACEHOLDER WITH ISLAND CLUSTER CARDS */
            clusters.map((cluster, index) => (
              <ClusterIsland
                key={cluster.id}
                clusterIndex={index + 1}
                concepts={cluster.concepts}
                edges={cluster.edges}
                selectedConcept={selectedConcept}
                onSelectConcept={setSelectedConcept}
              />
            ))
          )}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: Concept Context Panel */}
      {selectedConcept && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 z-20 shadow-2xl animate-in slide-in-from-right duration-150 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-base text-white">{selectedConcept.name}</h4>
              <button onClick={() => setSelectedConcept(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedConcept.description}</p>
          </div>
          <div className="h-32 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-600 italic">
            [ Video Segment Player Embed ]
          </div>
        </div>
      )}

    </div>
  );
}

function ClusterIsland({clusterIndex,concepts,edges,selectedConcept, onSelectConcept}){
  const containerRef = useRef(null);    //useRef stores reference to a DOM element
  const nodeRefs = useRef({});          //here i stored ref to a every concept node element
  const [lines,setLines] = useState([]); //SVG lines states

  //Set removes duplicate nodes, and then spread converts them back to nodes for arrangement
  const levels = [...new Set(concepts.map((c) => c.sort_order || 0))].sort((a,b) => a-b); //extracting unique tiers present in this cluster

  // Coordinate calculation function
  const calculateCoordinates = () =>{
    if(!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect(); //this inbuilt fn give margin from top and left as well as width and height
    const computedLines = [];

    //Looping through source and target ids
    edges.forEach((edge) =>{
      const srcId = edge.source_concept_id;
      const targetId = edge.target_concept_id;

      //extracted source and target element
      const srcEl = nodeRefs.current[srcId];
      const tgtEl = nodeRefs.current[targetId];

      if(srcEl && tgtEl){
        const srcRect = srcEl.getBoundingClientRect();  //rendering source rectangle
        const tgtRect = tgtEl.getBoundingClientRect();  //rendering target rectangle

        computedLines.push({
          id: `${srcId}-${tgtId}`,
          srcId,
          tgtId,
          x1: srcRect.right - containerRect.left,
          y1: srcRect.top + srcRect.height / 2 - containerRect.top,
          x2: tgtRect.left - containerRect.left,
          y2: tgtRect.top + tgtRect.height / 2 - containerRect.top,
        });
      }
    });
    setLines(computedLines);
  };
  useEffect(() => {
    calculateCoordinates();
    window.addEventListener('resize', calculateCoordinates);
    return () => window.removeEventListener('resize', calculateCoordinates);
  }, [concepts, edges]);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative backdrop-blur-sm shadow-xl">
      {/* Island Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Knowledge Island #{clusterIndex}
          </h4>
        </div>
        <span className="text-[10px] text-slate-500 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
          {concepts.length} Topics
        </span>
      </div>

      {/* Node Canvas Area */}
      <div ref={containerRef} className="flex items-center justify-start gap-16 relative min-h-[140px] overflow-x-auto pb-2">
        {/* SVG Arrow Canvas */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
          <defs>
            <marker id={`arrow-${clusterIndex}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" />
            </marker>
          </defs>
          {lines.map((line) => {
            const isActive = selectedConcept?.id === line.tgtId || selectedConcept?.id === line.srcId;
            const controlX = line.x1 + (line.x2 - line.x1) / 2;
            return (
              <path
                key={line.id}
                d={`M ${line.x1} ${line.y1} C ${controlX} ${line.y1}, ${controlX} ${line.y2}, ${line.x2} ${line.y2}`}
                fill="none"
                stroke={isActive ? '#818cf8' : '#334155'}
                strokeWidth={isActive ? 2.5 : 1.25}
                markerEnd={`url(#arrow-${clusterIndex})`}
                className="transition-all duration-150"
              />
            );
          })}
        </svg>

        {/* Concept Cards Grouped in Columns by Tier */}
        {levels.map((level) => (
          <div key={level} className="flex flex-col gap-4 min-w-[180px] z-10">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Tier {level + 1}
            </span>

            {concepts
              .filter((c) => (c.sort_order || 0) === level)
              .map((concept) => {
                const isSelected = selectedConcept?.id === concept.id;
                return (
                  <div
                    key={concept.id}
                    ref={(el) => (nodeRefs.current[concept.id] = el)}
                    onClick={() => onSelectConcept(concept)}
                    className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 bg-slate-950/80 hover:border-slate-700 ${
                      isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-md shadow-indigo-500/10' : 'border-slate-800 text-slate-300'
                    }`}
                  >
                    <h5 className="font-semibold text-xs text-white leading-snug">{concept.name}</h5>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}