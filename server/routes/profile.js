import express from "express";

router.get("/user-profile",reqAuth,async (req,res) =>{
    try{
        const userId = req.user.id;
        if(!userId){
            return res.status(401).json({
                success:false,
                message:"Unauthorized User!"
            });
        }

        const {data:attempts,error} = await supabase
        .from("user_performance")
        .select("is_correct,last_attempted_at,question_id")
        .eq("user_id",userId)

        if(error) throw error;

        const totalQues = attempts?attempts.length:0;
        const correctQues = attempts?attempts.filter(a=>a.is_correct === true).length:0;
        const overallAccuracy = totalQues>0?Math.round((correctQues/totalQues)*100):0;

        const profileData = {
            user:{
                name: req.user?.user_metadata?.full_name || req.user?.email?.split('@')[0] || "Learner",
                email: req.user?.email || "guest@lectura.app",
                avatarUrl: req.user?.user_metadata?.avatar_url || null,
                accountType: req.user?.is_anonymous ? "Guest Account" : "Registered Member"
            },
            status:{
                totalSolved: totalQues,
                correctSolved: correctQues,
                accuracy: overallAccuracy
            }
        };
        return res.status(200).json({
            success: true,
            data: profileData
        });
    }catch(err){
        console.error("GET /user-profile route crashed:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user profile dashboard stats.",
            error: err.message
        });
    }
});