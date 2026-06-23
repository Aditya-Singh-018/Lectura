import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { YoutubeTranscript } = require("youtube-transcript");
const express = require("express");
const app = express();
const path = require("path");

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });



function checkYoutubeUrl(link){
    try{
        const url = new URL(link);
        const hostName = url.hostname;
    
        if(hostName == "youtu.be"){
        const videoId = url.pathname.split('/')[1];
        return { success: true, data: { type: 'video', id: videoId }, error: null };
        }
        else if(hostName == "youtube.com" || hostName == "www.youtube.com"){
            const videoId = url.searchParams.get('v');
            const playlistId = url.searchParams.get('list');

            if(playlistId){
                return { success: true, data: { type: 'playlist', id: playlistId }, error: null };
            }
            if(videoId){
                return { success: true, data: { type: 'video', id: videoId }, error: null };
            }
        }
        return {success:false,data : {type:'invalid', id:null },error:"Not a valid domain link"};
    }
    catch(err){
        return {success:false,data:{type:'invalid',id:null},error:"Malforged String"};
    }

}

async function fetchSingleVideoTranscript(videoId){
    try{
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        return {success:true,data:transcript,error:null};
    }
    catch(err){
        return {success:false,data:null,error:"Transcription Failed"};
    }
    
}

async function fetchPlaylistVideoIds(playlistId){
    try{
        let baseUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${process.env.YOUTUBE_API_KEY}`;
        //let res = await fetch(url);
        let nextPageToken = null;
        let allVideoIds = [];

        do{
            let currentUrl = baseUrl;
            if(nextPageToken) {
                currentUrl += `&pageToken=${nextPageToken}`;
            }

            console.log("SENDING REQUEST TO URL:", currentUrl);
            let res = await fetch(currentUrl);
            let data = await res.json();
            
            if(data.error){
                return {success: false, data: null, error: data.error.message};
            }

            if(data.items){
                for(let item of data.items){
                    const videoId = item.snippet.resourceId.videoId;
                    if(videoId){
                        allVideoIds.push(videoId);
                    }
                }
            }
            nextPageToken = data.nextPageToken;
            
        }while(nextPageToken);

        return {success: true, data: allVideoIds, error: null};
    }
    catch(err){
        console.error("RAW CATCH ERROR DETECTED:", err);
        return { success: false, data: null, error: err.message };
    }
}

async function runTest() {
    console.log("Starting playlist fetch test...");
    
    //const playlistId = "PL4cUxeGkcBR9ckFsN0Eshac6O9mKndS_m";
    const playlistId = "PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn";
    const result = await fetchPlaylistVideoIds(playlistId); // Crucial await right here!
    
    console.log("--- PLAYLIST TEST RESULT ---");
    console.log(JSON.stringify(result, null, 2));
}

runTest();
