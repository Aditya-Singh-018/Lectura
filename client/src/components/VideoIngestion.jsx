import { useState } from 'react';

export default function VideoIngestion() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  // Implemented your complete 3-Job Architecture into the state shell
  const [steps, setSteps] = useState([
    { id: 'fetch', name: 'Extracting Lecture Transcript', type: 'Ingestion Engine', status: 'pending' },
    { id: 'chunk', name: 'Sliding-Window Character Splitting', type: 'Ingestion Engine', status: 'pending' },
    { id: 'vectorize', name: 'Generating 384-Dim Hugging Face Embeddings', type: 'Ingestion Engine', status: 'pending' },
    { id: 'extract', name: 'Groq Llama 3.1 Prerequisite Synthesis', type: 'Knowledge Graph', status: 'pending' },
    { id: 'dedup', name: 'Local Matrix Boundary Deduplication', type: 'Knowledge Graph', status: 'pending' },
    { id: 'sort', name: "Running Kahn's Cycle Resolution Sort", type: 'Knowledge Graph', status: 'pending' },
    { id: 'assessment', name: 'Compiling Dynamic MCQs & Flashcards', type: 'Curriculum Generation', status: 'pending' }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    //Resetting form data
    setSteps(prevSteps=>{   //previous Status is always carried in 
        return prevSteps.map(item =>{
            return {...item,status:"pending"};
        });
    });
    setStatus("submitting");
    setErrorMessage("");

    //Event Source Tracker
    try{
        const responce = await fetch("/api/ingest",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({url})
        });
        if(!responce.ok){
            setStatus("error");
            setErrorMessage("Network responce failed");
            return;
        }

        const data = await responce.json();
        const videoId = data.videoId;
        setStatus("processing");

        const es = new EventSource(`/api/ingest/status/${videoId}`);    //Event Source obj for managing SSEs
        es.onmessage = (event)=>{
            const payload = JSON.parse(event.data);

            if(payload.status == "failed"){
                setStatus("error");
                setErrorMessage(payload.message || "Distributed Pipeline Worker Failed");
                es.close(); //closed SSE
                return;
            }

            // Checkpoint B: Final Assessment generation complete
            if(payload.status === 'completed_all'){
                setSteps(prevSteps => prevSteps.map(item => ({ ...item, status: 'complete' })));
                setStatus("success");
                setUrl(""); // Clear out form bar input text safely
                es.close(); // Cut stream connection to avoid browser memory leaks
                return;
            }

            setSteps(prevSteps =>
                prevSteps.map(step => {
                if(step.id === payload.stepId) {
                    return { ...step, status: payload.status }; // updates target node to 'active' or 'complete'
                }
                return step;
                })
            );
        }

        es.onerror = (err) => {     //this SS event listeners fires up when an errors occurs
        console.error("SSE Connection Error:", err);
        setStatus("error");
        setErrorMessage("Lost active streaming context connection to server infrastructure.");
        es.close();
        };

    }catch(error){
        setStatus("error");
        setErrorMessage("System error encountered during server ingestion request.")
        console.error("Failed to fetch ingest route",error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header Info */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Convert Video Lectures into Smart Quizzes
        </h1>
        <p className="mt-3 text-lg text-gray-500 max-w-xl mx-auto">
          Enter a standalone YouTube link below to trigger our distributed extraction pipelines.
        </p>
      </div>

      {/* Action Submit Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="video-url" className="block text-sm font-semibold text-gray-700 mb-2">
              YouTube Video URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="video-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={status === 'submitting' || status === 'processing'}
                className="flex-1 block w-full px-4 py-3 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === 'submitting' || status === 'processing' || !url.trim()}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' && 'Queuing...'}
                {status === 'processing' && 'Processing...'}
                {status !== 'submitting' && status !== 'processing' && 'Process Video'}
              </button>
            </div>
          </div>
        </form>

        {/* Dynamic Alerts */}
        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-800">
            <strong>Processing Error:</strong> {errorMessage || 'An error occurred.'}
          </div>
        )}
        {status === 'success' && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm text-emerald-800">
            <strong>Ingestion Complete!</strong> Your knowledge graph and testing setup are ready inside your dashboard profile.
          </div>
        )}
      </div>

      {/* Hardened BullMQ Pipeline Execution Track */}
      {(status === 'processing' || status === 'success' || status === 'submitting') && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6">
            Active Processing Infrastructure Pipeline
          </h2>

          <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            {/* Grouping Filter for Visual Layout blocks */}
            {['Ingestion Engine', 'Knowledge Graph', 'Curriculum Generation'].map((jobGroup) => {
              const groupSteps = steps.filter(s => s.type === jobGroup);
              const isGroupActive = groupSteps.some(s => s.status === 'active' || s.status === 'complete');

              return (
                <div key={jobGroup} className={`space-y-4 ${isGroupActive ? 'opacity-100' : 'opacity-40'}`}>
                  {/* Job Header Tag */}
                  <div className="relative z-10 flex items-center gap-2 -ml-1">
                    <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                      jobGroup === 'Ingestion Engine' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      jobGroup === 'Knowledge Graph' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {jobGroup}
                    </span>
                  </div>

                  {/* Group Step Sub-Items */}
                  <div className="space-y-4 pl-4">
                    {groupSteps.map((step) => (
                      <div key={step.id} className="relative flex items-start gap-4">
                        {/* Bullet indicators */}
                        <div className="absolute -left-4 mt-1 flex items-center justify-center">
                          {step.status === 'complete' && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                              ✓
                            </div>
                          )}
                          {step.status === 'active' && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-[8px] font-bold animate-pulse">
                              ●
                            </div>
                          )}
                          {step.status === 'pending' && (
                            <div className="w-5 h-5 rounded-full bg-white border border-gray-200" />
                          )}
                        </div>

                        {/* Text descriptions */}
                        <div>
                          <p className={`text-sm font-medium transition-colors ${
                            step.status === 'complete' ? 'text-emerald-800' : 
                            step.status === 'active' ? 'text-amber-800 font-bold' : 'text-gray-400'
                          }`}>
                            {step.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}