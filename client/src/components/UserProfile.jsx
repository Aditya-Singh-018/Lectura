import React, {useState, useEffect} from "react";
import { supabase } from "../supabaseClient";

export default function UserProfile(){
    const [profile,setProfile] = useState(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        fetchUserProfile();
    },[]);

    const fetchUserProfile = async ()=>{
        setLoading(true);
        try{
            const {data: { session }} = await supabase.auth.getSession();
            const res = await fetch("/api/user-profile",{
                headers:{
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            const result = await res.json();
            if(result.success){
                setProfile(result.data);
            }
        }catch(error){
            console.error("Error loading user profile:",error);
        }finally{
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto my-16 p-12 bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <h3 className="text-base font-bold text-slate-800">Loading User Profile...</h3>
                <p className="text-xs text-slate-400 mt-1">Retrieving learning statistics and adaptive mastery</p>
            </div>
        );
    }

    const { user, status: stats } = profile || {};

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
            {/* Header / Avatar Card (with extra breathing room from top navbar) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md overflow-hidden">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                </div>
                
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                        {user?.accountType || 'Learner'}
                    </span>
                </div>
            </div>

            {/* Performance KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Total Questions Solved */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 relative">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Questions Answered</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mt-2">{stats?.totalSolved || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Total adaptive attempts logged</p>
                </div>

                {/* Correct Responses */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 relative">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Correct Answers</p>
                    </div>
                    <p className="text-3xl font-black text-emerald-600 mt-2">{stats?.correctSolved || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Successfully mastered items</p>
                </div>

                {/* Accuracy Percentage */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 relative">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Overall Accuracy</p>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-3xl font-black text-indigo-600">{stats?.accuracy || 0}%</p>
                    </div>
                    {/* Accuracy Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                        <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stats?.accuracy || 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* New User Encouragement Banner */}
            {(!stats?.totalSolved || stats.totalSolved === 0) && (
                <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center gap-4 text-indigo-900">
                    <div className="text-2xl">💡</div>
                    <div className="text-sm">
                        <p className="font-semibold">Start your adaptive learning journey!</p>
                        <p className="text-xs text-indigo-600 mt-0.5">Ingest a lecture or complete an adaptive quiz to start building your mastery score and accuracy statistics.</p>
                    </div>
                </div>
            )}
        </div>
    );
}