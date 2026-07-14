import { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

function DashboardShell({ user, currentView, onNavigate, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);  //for mobile dropDown

  return (
    <div className="min-h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden">
      
      {/* GLOBAL HEADER BAR */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-50">
        
        {/* Logo / Brand Alignment */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('ingest')}>
          <span className="text-sm font-bold bg-blue-600 px-2 py-1 rounded-md text-white font-mono">L</span>
          <span className="text-md font-bold text-white tracking-tight">Lectura</span>
        </div>

        {/* UNIFIED DESKTOP NAVIGATION TRACK (Hidden on mobile viewports natively) */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => onNavigate('ingest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${currentView === 'ingest' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Home Pipeline
          </button>
          <button 
            onClick={() => onNavigate('graph')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${currentView === 'graph' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Knowledge Graph
          </button>
          <button 
            onClick={() => onNavigate('quiz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${currentView === 'quiz' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Adaptive Testing
          </button>

          {/* DYNAMIC RIGHT-HAND AUTH BLOCKS (Nested safely inside desktop container tracker) */}
          <div className="flex items-center gap-3 border-l border-slate-800 pl-4 ml-2">
            {user?.is_anonymous ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onNavigate('login')} 
                  className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => onNavigate('signup')} 
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold shadow transition-all cursor-pointer"
                >
                  Link Account
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  ✉️ {user?.email}
                </span>
                <button 
                  onClick={onSignOut} 
                  className="text-xs font-bold text-rose-400 hover:bg-rose-950/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Exit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE DRAWER TRIGGER CONTROL */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-slate-400 hover:bg-slate-800 focus:outline-none cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* MOBILE DRILL-DOWN DROPDOWN DRAWER VIEWPORT BOX */}
      {isOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-slate-900 border-b border-slate-800 p-4 space-y-1.5 z-40 flex flex-col animate-fadeIn">
          <button 
            onClick={() => { onNavigate('ingest'); setIsOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Home Pipeline
          </button>
          <button 
            onClick={() => { onNavigate('graph'); setIsOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Knowledge Graph
          </button>
          <button 
            onClick={() => { onNavigate('quiz'); setIsOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Adaptive Testing
          </button>
          
          {/* Mobile Auth Flow Option Triggers */}
          {user?.is_anonymous ? (
            <div className="pt-2 border-t border-slate-800 flex flex-col space-y-1.5">
              <button 
                onClick={() => { onNavigate('login'); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Sign In
              </button>
              <button 
                onClick={() => { onNavigate('signup'); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-blue-400 text-xs font-semibold hover:bg-slate-800"
              >
                Link Account
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { onSignOut(); setIsOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-md text-rose-400 text-xs font-semibold bg-rose-950/20"
            >
              Exit Session
            </button>
          )}
        </div>
      )}

      {/* DYNAMIC CENTRAL WORKSPACE CANVAS AREA */}
      <main className="flex-1 pt-16 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col justify-center items-center">
        {currentView === 'graph' && <div className="text-white">Graph Viewport Placeholder</div>}
        {currentView === 'dashboard' && <div className="text-white">Dashboard Viewport Placeholder</div>}
        {currentView === 'quiz' && <div className="text-white">Quiz Viewport Placeholder</div>}
        
        {currentView === 'login' && (
          <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">Welcome Back</h2>
            <LoginForm />
          </div>
        )}

        {currentView === 'signup' && (
          <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">Upgrade Session</h2>
            <SignUpForm />
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardShell;