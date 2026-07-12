import path from "path";
import dotenv from "dotenv";

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
        const {data: edges} = supabase
        .from("concept_edges")
        .select("source_concept_id,target_concept_id")
        .in("target_concept_id",conceptIds);

        const { data: performanceLogs, error: perfErr } = await supabase
        .from("user_performance")
        .select(`is_correct, questions!inner(concept_id)`)  //joining the concept of a ques directly in user performance table 
        .eq("user_id", userId)                              //matching for only a particular user
        .in("questions.concept_id", conceptIds)            //only for those concepts whose id are part of current video
        .order("last_attempted_at", { ascending: false });  //LATEST ATTEMPTS FIRST!
        
        //Map lookup -> O(1)
        const masteryMap = new Map();
        if(!perfErr && performanceLogs){

            let statPerConcept = {};

            performanceLogs.forEach(log=>{
                const cId = log.questions.concept_id;
                if(!statsPerConcept[cId]){
                    statPerConcept[cId] = {correct: 0,total: 0};
                }
                //Sliding Window -> COntains only the last 3 attempts!
                if(statsPerConcept[cId].total < 3){
                    statsPerConcept[cId].total += 1;
                    if(log.is_correct){
                        statsPerConcept[cId].correct += 1;
                    }
                }
            });

            //Object.keys extract keys(Concept Id) and converts them in the form of array so i can easily iterate over them
            Object.keys(statsPerConcept).forEach(cId => {
                const { correct, total } = statsPerConcept[cId];
                const percentageScore = Math.round((correct / total) * 100);
                masteryMap.set(Number(cId), percentageScore);
            });
        }

        //Adjacency List for prerequisites : target -> sources , using this we will check that 
        //whether we can unlock target concept ques on the basis of sources masteryPercentage
        const prereqsForNode = new Map();
        edges?.forEach(edge =>{
            if(!prereqsForNode.has(edge.target_concept_id)){
                prereqsForNode[edge.target_concept_id] = [];
            }
        });
        prereqsForNode.get(edge.target_concept_id).push(edge.source_concept_id);

        const unlockableConcepts = concepts.filter(concept =>{
            const parentIds = prereqsForNode.get(concept.id) || []; //extracted parent ids
            return parentIds.every(parentId => {                    //returning those concepts for whose masteryPer>=60 of all parents
                const parentMastery = masteryMap.get(parentId) || 0;
                return parentMastery >= 60; 
            });
        });

        //Computing selection weights
        const finalPool = unlockableConcepts.length > 0 ? unlockableConcepts : concepts;
        let totalWeight = 0;
        const candidates = finalPool.map(concept => {
            const currentMastery = masteryMap.get(concept.id) || 0;
            const selectionWeight = Math.max(105 - currentMastery, 5); 
            totalWeight += selectionWeight;
            return { conceptId: concept.id, name: concept.name, weight: selectionWeight };
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
        
        //Pulling out a single ques from selectedConcept
        const { data: questions, error: qErr } = await supabase
            .from("questions")
            .select("id, question_text, options, difficulty_level")
            .eq("concept_id", selectedConcept.conceptId);

        if (qErr || !questions || questions.length === 0){
            return { success: false, message: "No active questions bound to this concept slot." };
        }

        const finalQuestionSelected = questions[Math.floor(Math.random()*questions.length)];
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