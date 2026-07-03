import express from 'express';
import { QueueEvents } from 'bullmq';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({path: path.resolve(process.cwd(), '.env')});

const router = express.Router();
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const queueEvents = new QueueEvents('youtube-ingestion',{connection: {url: REDIS_URL}});


router.get("/progress/:jobId",(req,res)=>{
    const {jobId} = req.params;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    //initital message
    res.write(`data: ${JSON.stringify({ status: 'connected', progress: 0 })}\n\n`);
    const handleProgress = ({ jobId: incomingJobId, data: progress }) => {
    if (incomingJobId === jobId) {
      res.write(`data: ${JSON.stringify({ progress })}\n\n`);
    }
    //this block fires up when progress reaches 100 %
    if(Number(progress) == 100){
        console.log(`Job ${jobId} finished successfully. Closing stream.`);
        queueEvents.off('progress', handleProgress);
        res.end();
    }
  };
  queueEvents.on('progress', handleProgress);

    // This fires IMMEDIATELY if the user closes the tab, 
    // refreshes the page, or cancels midway at 10%, 40%, or 80%!
  req.on('close', () => {
    console.log(`Clearing memory midway for job: ${jobId}`);
    queueEvents.off('progress', handleProgress); // 🟩 This is where the midway cleanup happens!
    res.end();
  });
  
});