import { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

function DashboardShell({ user, currentView, onNavigate, onSignOut, activeVideoId, children }) {
  const [isOpen, setIsOpen] = useState(false); // Mobile dropdown toggle

  return (
    <div className="min-h-screen w-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
      
      {/* GLOBAL HEADER BAR */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-indigo-700 flex items-center justify-between px-6 z-50">
        
        {/* Logo / Brand Alignment */}
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onNavigate('ingest')}
          >
            <span className="text-sm font-bold bg-white/20 px-2 py-1 rounded-md text-white font-mono shadow-md">L</span>
            <span className="text-md font-bold text-white tracking-tight">Lectura</span>
          </div>

          {/* Active Context Badge */}
          {activeVideoId && (
            <span className="hidden lg:inline-flex items-center gap-1.5 ml-4 px-2.5 py-0.5 bg-emerald-950/60 text-emerald-400 text-[11px] font-mono rounded-full border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active: {activeVideoId}
            </span>
          )}
        </div>

        {/* UNIFIED DESKTOP NAVIGATION TRACK */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => onNavigate('ingest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${currentView === 'ingest' ? 'bg-white/20 text-white shadow-md' : 'text-blue-100 hover:text-white hover:bg-white/15'}`}
          >
            Home Pipeline
          </button>
          
          <button 
            onClick={() => onNavigate('lectures')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              currentView === 'lectures' ? 'bg-white/20 text-white shadow-md' : 'text-blue-100 hover:text-white hover:bg-white/15'
            }`}
          >
            My Lectures
          </button>

          <button 
            onClick={() => onNavigate('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${(currentView === 'profile' || currentView === 'dashboard') ? 'bg-white/20 text-white shadow-md' : 'text-blue-100 hover:text-white hover:bg-white/15'}`}
          >
            User Profile
          </button>

          {/* DYNAMIC RIGHT-HAND AUTH BLOCKS */}
          <div className="flex items-center gap-3 border-l border-white/30 pl-4 ml-2">
            {user?.is_anonymous ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onNavigate('login')} 
                  className="text-xs text-white/80 hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => onNavigate('signup')} 
                  className="text-xs bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-semibold shadow transition-all cursor-pointer"
                >
                  Link Account
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-white/90 bg-white/10 border-white/20 px-2.5 py-1 rounded border ">
                  ✉️ {user?.email}
                </span>
                <button 
                  onClick={onSignOut} 
                  className="text-xs font-bold text-white/80 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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
            className="p-2 rounded-md text-white hover:bg-white/15 focus:outline-none cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* MOBILE DRILL-DOWN DROPDOWN DRAWER */}
      {isOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-white border-slate-200 shadow-lg p-4 space-y-1.5 z-40 flex flex-col animate-fadeIn">
          <button 
            onClick={() => { onNavigate('ingest'); setIsOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 text-xs font-semibold"
          >
            Home Pipeline
          </button>
          <button 
            onClick={() => {onNavigate('lectures'); setIsOpen(false);}}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              currentView === 'lectures' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            My Lectures
          </button>
          <button 
            onClick={() => { onNavigate('profile'); setIsOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 text-xs font-semibold"
          >
            User Profile
          </button>
          
          {/* Mobile Auth Triggers */}
          {user?.is_anonymous ? (
            <div className="pt-2 border-t border-slate-200 flex flex-col space-y-1.5">
              <button 
                onClick={() => { onNavigate('login'); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Sign In
              </button>
              <button 
                onClick={() => { onNavigate('signup'); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-blue-600 font-semibold hover:bg-blue-50 text-xs font-semibold "
              >
                Link Account
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { onSignOut(); setIsOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-md text-rose-600 bg-rose-50 hover:bg-rose-100 text-xs font-semibold "
            >
              Exit Session
            </button>
          )}
        </div>
      )}

      {/* DYNAMIC CENTRAL WORKSPACE CANVAS AREA */}
      <main className={`flex-1 w-full flex flex-col ${currentView === 'graph' ? 'pt-16' : 'pt-20 max-w-7xl mx-auto p-4 md:p-8 justify-start'}`}>
        {/* Render auth forms when in login/signup mode */}
        {currentView === 'login' && (
          <div className="w-full max-w-4xl mx-auto my-12 flex flex-row rounded-2xl overflow-hidden shadow-2xl min-h-[480px]">
            <div className="hidden md:flex w-2/5 bg-gradient-to-br from-blue-600 to-indigo-700
            flex-col justify-between p-10 relative overflow-hidden">
              {/* TOP SECTION: */}
              <div>
                <h2 className="text-3xl font-extrabold text-white leading-tight">
                  From lecture<br/>to mastery.
                </h2>
                <p className="text-blue-100 text-sm mt-3">
                  Turn any YouTube lecture into an adaptive quiz — instantly.
                </p>
              </div>
              {/* DECORATIVE CIRCLES (absolutely positioned, purely visual): */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute top-10 -right-6 w-24 h-24 rounded-full bg-white/10" />
              {/* BOTTOM BRAND: */}
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white px-2 py-1 rounded-md font-mono font-bold text-sm">L</span>
                <span className="text-white font-bold tracking-tight">Lectura</span>
              </div>
            </div>
            <div className= "w-full md:w-3/5 bg-white p-8 md:p-10 flex flex-col justify-center">
              <LoginForm onNavigate={onNavigate} />
            </div>
            
          </div>
        )}

        {currentView === 'signup' && (
          <div className="w-full max-w-4xl mx-auto my-12 flex flex-row rounded-2xl overflow-hidden shadow-2xl min-h-[480px]">
            <div className="hidden md:flex w-2/5 bg-gradient-to-br from-blue-600 to-indigo-700
            flex-col justify-between p-10 relative overflow-hidden">
              {/* TOP SECTION: */}
              <div>
                <h2 className="text-3xl font-extrabold text-white leading-tight">
                  From lecture<br/>to mastery.
                </h2>
                <p className="text-blue-100 text-sm mt-3">
                  Turn any YouTube lecture into an adaptive quiz — instantly.
                </p>
              </div>
              {/* DECORATIVE CIRCLES (absolutely positioned, purely visual): */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute top-10 -right-6 w-24 h-24 rounded-full bg-white/10" />
              {/* BOTTOM BRAND: */}
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white px-2 py-1 rounded-md font-mono font-bold text-sm">L</span>
                <span className="text-white font-bold tracking-tight">Lectura</span>
              </div>
            </div>
            <div className= "w-full md:w-3/5 bg-white p-8 md:p-10 flex flex-col justify-center">
              <SignUpForm onNavigate={onNavigate}/>
            </div>
          </div>
        )}

        {/* Render child view component when in standard app views */}
        {currentView !== 'login' && currentView !== 'signup' && children}
      </main>
    </div>
  );
}

export default DashboardShell;