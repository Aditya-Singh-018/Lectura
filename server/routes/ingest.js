import express from "express";
import { ingestQueue } from "../workers/ingestWorker.js";
import { reqAuth } from "../middleware/authMiddleware.js";
import {checkYoutubeUrl} from "../services/fetchTranscript.js";

import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const router = express.Router();

router.post("/ingest", reqAuth, async (req,res)=>{
    const {url} = req.body;
    const userId = req.user.id;
    if(!url){
        return res.status(400).json({error:"Missing video url parameter"});
    }
    try{
        const urlAnalysis = checkYoutubeUrl(url);
        if(urlAnalysis.error){
            return res.status(400).json({
                error:urlAnalysis.error
            });
        }
        const videoId = urlAnalysis.data.id;
        const job = await ingestQueue.add("ingest-job",{url:url,userId});
        return res.status(202).json({
            message:"Ingestion job successfully queued",
            jobId:job.id,
            videoId:videoId
        });
    }catch(err){
        return res.status(500).json({error:err.message||'Failed to queue ingestion job'});
    }
});

//This is a SSE API it is different from a normal API
router.get("/ingest/status/:videoId",async (req,res) =>{
    try{
        console.log("STATUS ROUTE HIT");
        const {videoId,userId} = req.params;

        res.setHeader("Content-Type","text/event-stream");  //continuous stream of data
        res.setHeader("Cache-Control","no-cache");          //always fetch the latest update no previous cached data
        res.setHeader("connection","keep-alive");           //HTTP connection to be kept alive

        //normally node waits before sending headers, this forces
        //send headers immediately after SSE connection has been established
        res.flushHeaders(); 

        let interval;

        const sendStatus = async()=>{
            const {data,error} = await supabase
            .from("videos")
            .select("progress,status,current_stage")
            .eq("video_id",videoId)
            .maybeSingle();

            if(error) throw error;

            if(!data){
                console.log("No data for status!");
                return;
            }

            //sending data through SSE (this is a SSE format)
            console.log("SENDING STATUS: ",data);
            res.write(`data:${JSON.stringify(data)}\n\n`);  //using \n\n browser receives it as event

            if(data.status == "success" || data.status == "error"){
                clearInterval(interval);    //clear interval stops the timer
                res.end();
            }
        }
        await sendStatus();     //fetch from database
        interval = setInterval(sendStatus,1000);    //javascript timer

        req.on("close",()=>{
            clearInterval(interval);
        });
    }catch(error){
        res.write(`data:${JSON.stringify({status:"error",message:error.message})}\n\n`);
    }
    
});

export default router;