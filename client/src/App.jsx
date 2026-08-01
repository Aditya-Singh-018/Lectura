import { useState, useEffect } from 'react';    //named export's import
import { supabase } from './supabaseClient';

import IngestView from './components/IngestView';   //default export's import
import KnowledgeGraphDashboard from "./components/KnowledgeGraphDashboard";
import AdaptiveQuiz from "./components/AdaptiveQuiz";
import UserProfile from './components/UserProfile';
import LecturesView from './components/LecturesView'; 

import DashboardShell from './components/DashboardShell';

function App(){
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('ingest'); // Default view
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [loading, setLoading] = useState(true);   //initially start loading
  const [authMode, setAuthMode] = useState('login'); // Starts window display at login card profile

  // Monitor Supabase session states dynamically
  useEffect(() =>{
    //responce obj -> data obj -> session info
    const initializeAuth = async ()=>{
      try{
        const {data:{session}} = await supabase.auth.getSession()  //nested object destructuring
        if(session) setUser(session.user);    //if session id exists then set the user and ...
        else{
          const {data:{user}, error } = await supabase.auth.signInAnonymously();
          if(error) throw error;
          console.log(user);
          setUser(user);
        }
        setLoading(false);                    //stop loading
      }catch(error){
        console.log("User Authentication Error",error.stack);
      }
    };
    initializeAuth();

    // Hidden worker catches returning sessions, manual logins, and logouts
    const{ data: {subscription}} = supabase.auth.onAuthStateChange((event, session) =>{
      if(session){
        setUser(session.user);
      }else{
        setUser(null);
        setCurrentView('ingest'); // Reset to entry screen on session close
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();  //this function sits inside subscription obj
  }, []);

  const handleVideoProcessed = (videoId) => {
    setActiveVideoId(videoId);
    setCurrentView('graph'); // Automatically jump to Knowledge Graph
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSelectGraph = (videoId) => {
    setActiveVideoId(videoId);
    setCurrentView('graph');
  };
  const handleSelectQuiz = (videoId) => {
    setActiveVideoId(videoId);
    setCurrentView('quiz');
  };

  if(loading){
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs">
        Hydrating App Shell...
      </div>
    );
  }

  return (
    <DashboardShell 
      user={user} 
      currentView={currentView} 
      onNavigate={setCurrentView}
      activeVideoId={activeVideoId}
    >
      {currentView === 'ingest' && (
        <IngestView 
          user={user} 
          onNavigate={setCurrentView} 
          onVideoProcessed={handleVideoProcessed} 
        />
      )}

      {currentView === 'lectures' && (
        <LecturesView 
          onSelectGraph={handleSelectGraph} 
          onSelectQuiz={handleSelectQuiz} 
        />
      )}

      {currentView === 'graph' && (
        <KnowledgeGraphDashboard 
          videoId={activeVideoId} 
          onStartQuiz={() => setCurrentView('quiz')} 
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'quiz' && (
        <AdaptiveQuiz 
          videoId={activeVideoId} 
          onNavigate={setCurrentView} 
        />
      )}

      {(currentView === 'profile' || currentView === 'dashboard') && (
        <UserProfile user={user} />
      )}
    </DashboardShell>
  );
}

export default App;