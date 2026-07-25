import React, {useState, useEffect} from "react";

export default function UserProfile(){
    const [profile,setProfile] = useState(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        fetchUserProfile();
    },[]);

    const fetchUserProfile = async ()=>{
        setLoading(true);
        try{
            const res = await fetch("/api/user-profile",{
                headers:{
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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

    if(loading){
        return(
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 animate-pulse">Loading profile dashboard...</p>
            </div>
        );
    }

    const { user, status: stats } = profile || {};

    return(
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header / Avatar Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md overflow-hidden">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                </div>
                
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                        {user?.accountType}
                    </span>
                </div>
            </div>

            {/* Performance KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Total Questions Solved */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Questions Answered</p>
                    <p className="text-3xl font-black text-gray-800 mt-2">{stats?.totalSolved}</p>
                    <p className="text-xs text-gray-500 mt-1">Total adaptive attempts logged</p>
                </div>

                {/* Correct Responses */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Correct Answers</p>
                    <p className="text-3xl font-black text-emerald-600 mt-2">{stats?.correctSolved}</p>
                    <p className="text-xs text-gray-500 mt-1">Successfully mastered items</p>
                </div>

                {/* Accuracy Percentage */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Overall Accuracy</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-3xl font-black text-indigo-600">{stats?.accuracy}%</p>
                    </div>
                    {/* Accuracy Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                        <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stats?.accuracy}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}