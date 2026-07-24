import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function submitAnswer(userId,questionId,selectedOptionIndex){
    try{
        const {data: question,error: qErr} = await supabase
            .from("questions")
            .select("correct_option,concept_id")
            .eq("id",questionId)
            .single();

        if(qErr || !question){
            throw new Error(`Question verification failed. ID ${questionId} not found.`);
        }

        const isCorrect = question.correct_option === Number(selectedOptionIndex);

        const{error: insertErr} = await supabase
            .from("user_performance")
            .insert({
                user_id: userId,
                question_id: questionId,
                is_correct: isCorrect,
                last_attempted_at: new Date().toISOString()
            });
    
        if(insertErr){
            throw insertErr;
        }

        console.log(`[PERFORMANCE LOG] User ${userId} answered Q#${questionId}. Correct: ${isCorrect}`);
        
        return {
            success: true,
            is_correct: isCorrect,
            correct_option: question.correct_option,
            concept_id: question.concept_id
        };
    }catch(err){
        console.error("[SUBMIT ANSWER EXCEPTION]:", err.message);
        throw err;
    }
}