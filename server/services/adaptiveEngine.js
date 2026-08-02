import path from "path";
import dotenv from "dotenv";

import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function selectNextQuestion(userId,videoId){
    try{
        const {data: concepts,error: conceptsErr} = await supabase
        .from("concepts")
        .select("id,name,sort_order")
        .eq("video_id",videoId)
        .order("sort_order",{ascending:true});

        if(conceptsErr || !concepts || concepts.length == 0){
            throw new Error("No concepts discovered for this video");
        }

        const conceptIds = concepts.map(c=>c.id);

        //fetch all the prerequisite concept_edges for all the target concepts because if 
        //a user for unlocking current (target) concepts need to see that the what is the score of previous concepts
        //so selecting target concets rows are must along with them source concepts will already be present
        const {data: edges} = await supabase
        .from("concept_edges")
        .select("source_concept_id,target_concept_id")
        .in("target_concept_id",conceptIds);

        // 1. Fetch ALL questions for ALL concepts in this video FIRST
        const { data: allQuestions, error: qErr } = await supabase
            .from("questions")
            .select("id, concept_id, question_text, options, difficulty_level")
            .in("concept_id", conceptIds);

        if (qErr || !allQuestions || allQuestions.length === 0) {
            return null; // No questions exist -> complete
        }

        const videoQuestionIds = allQuestions.map(q => q.id);
        const questionConceptMap = new Map();
        allQuestions.forEach(q => questionConceptMap.set(String(q.id), Number(q.concept_id)));

        // 2. Fetch all performance logs for this user on these specific video questions (NO JOINS!)
        const { data: performanceLogs, error: perfErr } = await supabase
            .from("user_performance")
            .select("question_id, is_correct")
            .eq("user_id", userId)
            .in("question_id", videoQuestionIds)
            .order("last_attempted_at", { ascending: false });

        if (perfErr) {
            console.error("[ADAPTIVE ENGINE] Error fetching user_performance logs:", perfErr);
        }

        // Track all previously attempted question IDs as Strings (never repeat an attempted question in the quiz)
        const attemptedQIds = new Set(
            (performanceLogs || []).map(log => String(log.question_id))
        );
        console.log(`[ADAPTIVE ENGINE] Video ${videoId}: ${attemptedQIds.size}/${allQuestions.length} questions attempted by user ${userId}`);

        // Map lookup -> O(1)
        const masteryMap = new Map();
        if (!perfErr && performanceLogs) {
            let statsPerConcept = {};

            performanceLogs.forEach(log => {
                const cId = questionConceptMap.get(String(log.question_id));
                if (!cId) return;
                if (!statsPerConcept[cId]) {
                    statsPerConcept[cId] = { correct: 0, total: 0 };
                }
                // Sliding Window -> Contains only the last 3 attempts!
                if (statsPerConcept[cId].total < 3) {
                    statsPerConcept[cId].total += 1;
                    if (log.is_correct) {
                        statsPerConcept[cId].correct += 1;
                    }
                }
            });

            Object.keys(statsPerConcept).forEach(cId => {
                const { correct, total } = statsPerConcept[cId];
                const percentageScore = Math.round((correct / total) * 100);
                masteryMap.set(Number(cId), percentageScore);
            });
        }

        // 3. Group unattempted questions by concept (excluding all previously attempted questions via String ID comparison)
        const unattemptedByConcept = new Map();
        allQuestions.forEach(q => {
            const qIdStr = String(q.id);
            const cIdNum = Number(q.concept_id);
            if (!attemptedQIds.has(qIdStr)) {
                if (!unattemptedByConcept.has(cIdNum)) {
                    unattemptedByConcept.set(cIdNum, []);
                }
                unattemptedByConcept.get(cIdNum).push(q);
            }
        });

        // If no unattempted questions remain in the entire video, the quiz is completed
        if (unattemptedByConcept.size === 0) {
            console.log(`[ADAPTIVE ENGINE] All available questions attempted for video ${videoId}. Completing quiz.`);
            return null;
        }

        //Adjacency List for prerequisites : target -> sources , using this we will check that 
        //whether we can unlock target concept ques on the basis of sources masteryPercentage
        const prereqsForNode = new Map();
        edges?.forEach(edge => {
            const tId = Number(edge.target_concept_id);
            const sId = Number(edge.source_concept_id);
            if (!prereqsForNode.has(tId)) {
                prereqsForNode.set(tId, []);
            }
            prereqsForNode.get(tId).push(sId);
        });

        // Only consider concepts that still have unattempted questions available
        const conceptsWithQuestions = concepts.filter(c => (unattemptedByConcept.get(Number(c.id))?.length || 0) > 0);

        const unlockableConcepts = conceptsWithQuestions.filter(concept => {
            const parentIds = prereqsForNode.get(Number(concept.id)) || []; // extracted parent ids
            return parentIds.every(parentId => {
                const parentMastery = masteryMap.get(Number(parentId)) || 0;
                return parentMastery >= 60; 
            });
        });

        // Computing selection weights on valid pool
        const finalPool = unlockableConcepts.length > 0 ? unlockableConcepts : conceptsWithQuestions;
        let totalWeight = 0;
        const candidates = finalPool.map(concept => {
            const cIdNum = Number(concept.id);
            const currentMastery = masteryMap.get(cIdNum) || 0;
            const selectionWeight = Math.max(105 - currentMastery, 5); 
            totalWeight += selectionWeight;
            return { conceptId: cIdNum, name: concept.name, weight: selectionWeight };
        });

        //Spinning Roullete Wheel
        const randomTargetValue = Math.random()*totalWeight;    //randomly selected a number (throwing a dart)
        let cumulativeSum = 0;
        let selectedConcept = candidates[candidates.length - 1];    //randomly selected a concept out of all candidates
        for(const candidate of candidates){                         
            cumulativeSum += candidate.weight;                      
            if(cumulativeSum >= randomTargetValue ){    //selecting a concept based on prefix cummulative sum (place where dart landed)
                selectedConcept = candidate;
                break;
            }
        }
        //This works because totalWeight and cummulative sum are both calculated the same way (prefix sum way)

        console.log(`[ADAPTIVE ENGINE] Selected concept: "${selectedConcept.name}" (Weight: ${selectedConcept.weight}/${totalWeight})`);
        
        //Pulling out a single unattempted question from selectedConcept
        const availableQuestions = unattemptedByConcept.get(Number(selectedConcept.conceptId));
        const finalQuestionSelected = availableQuestions[Math.floor(Math.random()*availableQuestions.length)];

        return{
            success: true,
            concept_id: selectedConcept.conceptId,
            concept_name: selectedConcept.name,
            question: finalQuestionSelected
        };
    }catch(err){
        console.error("[CRITICAL ADAPTIVE CORE EXCEPTION]:", err.message);
        throw err;
    }
}