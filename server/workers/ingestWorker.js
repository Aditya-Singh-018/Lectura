import {Queue,Worker} from "bullmq";
import path from "path";
import IORedis from "ioredis";
import dotenv from "dotenv";

import {checkYoutubeUrl} from "../services/fetchTranscript";
import {fetchSingleVideoTranscript, fetchPlaylistVideoIds} from "../services/fetchTranscript";
import { cleanTranscript,chunkText } from "../services/chunkText";
import { embedChunks } from "../services/embedChunks";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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
            console.log(urlAnalysis.error);
        }

        if(urlAnalysis.data.type == "playlist"){
            console.log("Playlist detected, fetching Videos...");
            const videoIds = await fetchPlaylistVideoIds(urlAnalysis.data.id);
            for(let videoId of videoIds){
                const singleVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                await ingestQueue.add("ingest-job",{url:singleVideoUrl,playlistId:urlAnalysis.data.id});
            }
            await job.updateProgress(100);
            return { success: true,data:null, error : null};
        }
        //if worker is processing a single video
        
        let transcript = await fetchSingleVideoTranscript(urlAnalysis.data.id);
        await job.updateProgress(40);

        let cleanedText = cleanTranscript(transcript);
        await job.updateProgress(60);

        let chunks = chunkText(cleanedText);
        await job.updateProgress(70);

        let embedVector = await embedChunks(chunks);
        await job.updateProgress(80);

        console.log(`Writing vectors and relational text segments to Supabase...`);
        try{
            let insertPayload = chunks.map((chunkText,index)=>{
                return{
                    playlist_id:playlistId,
                    video_id:urlAnalysis.data.id,
                    content:chunkText,
                    start_time:null,
                    embedding:embedVector[index],
                };
            });

            //single bulk insertion
            const { data, error } = await supabase
            .from('chunks') 
            .insert(insertPayload);

            if(error){
                throw new Error(`Supabase Vector Insertion Failed: ${error.message}`);
            }
            console.log(`Successfully indexed ${insertPayload.length} vectors into pgvector.`);
            await updateProgress(100);
        }
        catch(dbError){
            console.error("Database Cascade Failure:", dbError);
            throw dbError;
        }
    }catch(error){
        throw new Error(`Worker failed: ${error.message}`);
    }
},{connection});

export {ingestQueue,connection};
