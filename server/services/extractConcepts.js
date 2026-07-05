import Groq from "groq-sdk";
import path from "path";

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env')});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function extractConcepts(chunks){
    try{
        if(!chunks || chunks.length === 0){
            return { success: true, concepts: [], prerequisites: []};
        }

        const unifiedChunk = chunks.map((chunk,idx) =>
            `[Chunk #${idx + 1}]\n${chunk}`).join("\n\n---\n\n");
        
        //there are different options available like voice to text and all, i am just using chat completions feature
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages:[{
                role: "system",
                content: `You are an advanced educational curriculum engineer.
                    Your job is to analyze video transcription segments and compile a structural roadmap.
                    CRITICAL: You must output a single, raw, minified JSON object matching the requested 
                    schema exactly. Do not include any conversational introductions, markdown wrappers 
                    (like \`\`\`json), or conversational footnotes.
                    TARGET JSON SCHEMA:
                    {
                    "concepts":[
                        {
                        "id": "lowercase-unique-slug-string",
                        "name": "Human Readable Title",
                        "description": "Clear explanation of the concept based ONLY on context text."
                        }
                    ],
                    "prerequisites":[
                        {
                        "source": "id-of-required-baseline-concept",
                        "target": "id-of-dependent-advanced-concept"
                        }
                    ]
                    }
                    Rules:
                    1. If Concept 'A' must be understood before Concept 'B' can make sense, log a prerequisite edge mapping source=A, target=B.
                    2. Ensure every prerequisite ID corresponds exactly to an ID declared inside your concepts block.`
            },
            {
                role:"user",
                content: `Analyze the following lecture context segments and map out the 
                standalone concepts and their internal directional dependencies:\n\n${unifiedChunk}`
            }],
            response_format: {type: "json_object"},
            temperature: 0.2,   //low temp val forces concsistency and reduces hallucinations
        });

        //digging the llm responce payload from nested responce object
        const rawContent = completion.choices[0]?.message?.content;
        const graphData = JSON.parse(rawContent);

        return{
            success: true,
            concepts: graphData.concepts || [],
            prerequisites: graphData.prerequisites || []
        };

    }catch(error){
        console.error("Graph Extraction Failure: ",error);
        return{
            success: false,
            concepts: [],
            prerequisites: [],
            error: error.message
        };
    }
}