import { useState, useEffect } from 'react';    //named export's import
import { supabase } from './supabaseClient';
import IngestView from './components/IngestView';   //default export's import
import DashboardShell from './components/DashboardShell';
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';

function App(){
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('ingest'); // Default view
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
          console.log(user);
          setUser(user);
        }
        setLoading(false);                    //stop loading
      }catch(error){
        console.log("User Authentication Error",error.stack);
      }
    }
    initializeAuth();
  },[]);

    // Hidden worker catches returning sessions, manual logins, and logouts
    const{ data: {subscription}} = supabase.auth.onAuthStateChange((event, session) =>{
      if(session){
        setUser(session.user);
      }else{
        setUser(null);
        setCurrentView('ingest'); // Reset to entry screen on session close
      }
      setLoading(false);
    return () => subscription.unsubscribe();  //this function sits inside subscription obj
  }, []);

  if(loading){
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs">
        Hydrating App Shell...
      </div>
    );
  }

  if(currentView == "ingest"){
    return(
      <IngestView user = {user} onNavigate = {setCurrentView}></IngestView> //onNavigat is a prop para
    );
  }

  if(currentView == "quiz"){
    return(
      <Quiz user = {user} onNavigate = {setCurrentView}></Quiz> //onNavigate -> part of lifting state up
    )
  }

  if(currentView == "graph" || currentView == "dashboard"){
    if(!user || user.is_anonymous){
      return <IngestView user = {user} onNavigate = {setCurrentView}></IngestView>
    }
  }
  return(
    <DashboardShell 
      user={user} 
      currentView={currentView} 
      onNavigate={setCurrentView} 
    />
  );
}

export default App;