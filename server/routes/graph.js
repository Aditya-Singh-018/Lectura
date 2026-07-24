import express from "express";
import { extractConcepts } from "../services/extractConcepts";


const router = express.Router();

//route to fetch knowledge graph for single video
router.get("/graph/video/:videoId",async (req,res)=>{
    const {videoId} = req.params;
    const userId = req.user.id;

    try{
        //validating user who is req for this video
        //Server-side Validation
        const { data: videoRecord, error: authErr } = await supabase
        .from('videos')
        .select('video_id')
        .eq('video_id', videoId)
        .eq('user_id', userId)
        .single();

        if(authErr || !videoRecord){
            return res.status(403).json({ 
                error: "Unauthorized access or invalid workspace profile configuration." 
            });
        }

        const {data: concepts,error: conceptsError} = await supabase
        .from("concepts")
        .select("id, name, description, sort_order")
        .eq("video_id",videoId);

        if(conceptsError) throw conceptsError;

        if(!concepts || concepts.length === 0){
            return res.json({ concepts: [], edges: []});
        }

        const conceptIds = concepts.map(c => c.id);

        const { data: edges,error:edgesErr } = await supabase
        .from('concept_edges')
        .select('source_concept_id, target_concept_id')
        .in('source_concept_id', conceptIds)
        .in('target_concept_id', conceptIds);

        if(edgesErr) throw edgesErr;
        
        res.json({concepts,edges});
    }catch(error){
        console.error("Faliure in single video knowlege graph route",error.message);
        res.status(500).json({ error: "Internal server processing error reading knowledge structures." });
    }
});

//router to fetch knowledge graph for complete user's history
router.get("/graph/",async(req,res) =>{
    const userId = req.user.id;

    try{
        //Note: Server Side Validation not req bcz below code automatically does it 
        //if someone tries to exploit the route with fake userId, all they will receive is an empty array

        const {data: concepts,error: conceptsError} = await supabase
        .from("concepts")
        .select("id, name, description, sort_order,videos!inner(user_id)")
        .eq("videos.user_id",userId);

        if(conceptsError) throw conceptsError;

        if(!concepts || concepts.length === 0){
            return res.json({ concepts: [], edges: []});
        }
        const conceptIds = concepts.map(c => c.id);

        const { data: edges,error:edgesErr } = await supabase
        .from('concept_edges')
        .select('source_concept_id, target_concept_id')
        .in('source_concept_id', conceptIds)
        .in('target_concept_id', conceptIds);

        if(edgesErr) throw edgesErr;
        
        res.json({concepts,edges});
    }catch(error){
        console.error("Faliure in global knowlege graph generation route",error.message);
        res.status(500).json({ error: "Internal server processing error reading knowledge structures." });
    }
});

//router to fetch all the videos for a user
router.get("/videos",async (req,res)=>{
    try{
        const userId = req.user.id; //This comes from authentication middleware

        const {data:videos,error:videosFetchError} = await supabase
        .from("videos")
        .select("id, video_id, created_at")
        .eq("user_id",userId)
        .order("created_at",{ascending:false});

        if(videosFetchError) throw videosFetchError;

        return res.json({videos});
    }catch(error){
        return res.status(500).json({error:error.message});
    }
});

export default router;

