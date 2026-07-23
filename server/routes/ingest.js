import express from "express";
import { ingestQueue } from "../workers/ingestWorker";

const router = express.Router();

router.post("/ingest", async (req,res)=>{
    const {url} = req.body;
    const userId = req.user.id;
    if(!url){
        return res.status(400).json({error:"Missing video url parameter"});
    }
    try{
        const job = await ingestQueue.add("ingest-job",{url:videoUrl,userId});
        return res.status(202).json({
            message:"Ingestion job successfully queued",
            jobId:job.id,
        });
    }catch(err){
        return res.status(500).json({error:err.message||'Failed to queue ingestion job'});
    }
});

export default router;