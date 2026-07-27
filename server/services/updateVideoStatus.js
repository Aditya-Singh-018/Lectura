import path from "path";
import dotenv from "dotenv";

import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function updateVideoStatus(
    videoId,
    progress,
    status,
    currentStage
){

    const {error} = await supabase
        .from("videos")
        .update({
            progress,
            status,
            current_stage: currentStage
        })
        .eq("video_id", videoId);


    if(error){
        console.error(
          "VIDEO STATUS UPDATE FAILED:",
          error.message
        );
    }
}