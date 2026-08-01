import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { reqAuth } from "../middleware/authMiddleware.js";
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();


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

export default router;