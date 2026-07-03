import {Queue,Worker} from "bullmq";
import path from "path";
import IORedis from "ioredis";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

import {checkYoutubeUrl} from "../services/fetchTranscript.js";
import {fetchSingleVideoTranscript, fetchPlaylistVideoIds} from "../services/fetchTranscript.js";
import { cleanTranscript,chunkText } from "../services/chunkText.js";
import { embedChunks } from "../services/embedChunks.js";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const connection = new IORedis(REDIS_URL,{maxRetriesPerRequest: null}); // Required by BullMQ to prevent connection drops

const ingestQueue = new Queue("youtube-ingestion",{connection});

const ingestWorker = new Worker("youtube-ingestion",async (job)=>{
    const {url,playlistId} = job.data;
    console.log(`Processing job with job id ${job.id} and url ${url}`);
    try{
        await job.updateProgress(10);

        let urlAnalysis = checkYoutubeUrl(url);

        await job.updateProgress(30);

        if(urlAnalysis.error){
            console.log("URL Analysis Error: ",urlAnalysis.error);
            throw new Error(`Invalid URL parsed: ${urlAnalysis.error}`);
        }

        const isChildJob = job.data.isChildJob || false;

        if(urlAnalysis.data.type == "playlist" && !isChildJob){
            console.log("Playlist detected, fetching Videos...");
            const videoIdsObj = await fetchPlaylistVideoIds(urlAnalysis.data.id);
            const videoIds = videoIdsObj.data;

            if (!videoIds || !Array.isArray(videoIds)) {
                throw new Error("Failed to extract video array from playlist target resource.");
            }

            for(let videoId of videoIds){
                const singleVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                await ingestQueue.add("ingest-job",{url:singleVideoUrl,playlistId:urlAnalysis.data.id,isChildJob:true});
            }
            await job.updateProgress(100);
            return { success: true,data:null, error : null};
        }
        //if worker is processing a single video
        
        let transcriptObj = await fetchSingleVideoTranscript(urlAnalysis.data.id);
        let transcript = transcriptObj.data;
        await job.updateProgress(40);

        let cleanedTextObj = cleanTranscript(transcript);
        let cleanedText = cleanedTextObj.data;
        await job.updateProgress(60);

        let chunksObj = chunkText(cleanedText);
        let chunks = chunksObj.data;
        await job.updateProgress(70);

        let embedVectorObj = await embedChunks(chunks);
        let embedVector = embedVectorObj.data;
        await job.updateProgress(80);

        console.log(`Writing vectors and relational text segments to Supabase...`);
        try{
            let insertPayload = chunks.map((chunkText,index)=>{
                return{
                    playlist_id:null,
                    video_id:urlAnalysis.data.id,
                    content:chunkText,
                    start_time:0,
                    embedding:embedVector[index],
                };
            });

            //single bulk insertion
            const { data, error } = await supabase
            .from('chunks') 
            .insert(insertPayload);

            if(error){
                throw error;
                //throw new Error(`Supabase Vector Insertion Failed: ${error.message}`);
            }
            console.log(`Successfully indexed ${insertPayload.length} vectors into pgvector.`);
            await job.updateProgress(100);
        }
        catch(dbError){
            console.error(dbError);
            console.error("CAUSE:", dbError.cause);
            console.error("Database Cascade Failure:", dbError);
            throw dbError;
        }
    }catch(error){
        throw new Error(`Worker failed: ${error.message}`);
    }
},{connection});

export {ingestQueue,connection};
