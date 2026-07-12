import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateQuestions(concepts, unifiedChunk){
    try{
        if(!concepts || concepts.length === 0){
            return { success: true, assessments:[]};
        }
        const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: `You are a premier educational psychometrician and curriculum assessment architect for Lectura.
Your task is to analyze an array of targeted video concepts and the full transcript context to synthesize a complete batch assessment matrix.

CRITICAL ARCHITECTURAL MANDATES:
1. STRICT SEQUENTIAL ARRAY LOOPING: You MUST process the provided "TARGET CONCEPTS" array sequentially, concept-by-concept, moving from the first item to the very last item. Do not skip, merge, or omit any concepts.
2. ONE-TO-ONE CORRESPONDENCE MAPPING: For every individual concept item present in the input list, you must generate a matching assessment object entry inside the output "assessments" array. The "concept_id" in your output MUST match the input concept's "id" exactly.
3. TRANSCRIPT CONTEXT BOUNDARY: The generated questions and flashcard MUST align strictly with how each concept was framed, explained, and illustrated inside the provided raw video transcript. Do not generate generic, out-of-context academic questions.
4. PER-CONCEPT RIGID ASSESSMENT BUDGET: For EACH concept item processed, you must generate exactly:
   - THREE Multiple Choice Questions (MCQs)—one mapped to difficulty 1, one to difficulty 2, and one to difficulty 3.
     * difficulty 1 (Easy): Evaluates baseline definitions, clear explicit facts, or foundational rules stated.
     * difficulty 2 (Medium): Evaluates application mechanics, scenario tracking, or relational dependencies.
     * difficulty 3 (Hard): Evaluates complex constraints, diagnostics, edge cases, or systemic side-effects.
   - EXACTLY ONE Spaced-Repetition Flashcard capturing the absolute highest value definition, core syntax rule, or vital insight for that concept.
5. GRANULAR CHOICE-LEVEL REASONING: Every MCQ must contain exactly 4 options. For EACH option, provide a concise explanation note detailing exactly WHY it is correct or incorrect based on the video context.
6. RANDOMIZED SOLUTION SLOTS: You MUST shuffle and randomize the placement of the correct choice across all index positions (0, 1, 2, or 3) completely randomly for every question. The correct choice must never rest at a static or predictable pattern.

Your output must be a single, raw, minified JSON object matching the requested schema layout exactly. No preambles, markdown code blocks (\`\`\`json), or conversational footnotes.`
            },
            {
                role: "user",
                content: `Analyze the video text material below and synthesize the balanced assessment blocks (3 MCQs + 1 Flashcard) for every single concept listed. Loop through the array from first to last item.

TARGET CONCEPTS FOR GENERATION:
${JSON.stringify(concepts)}

RAW VIDEO TRANSCRIPT CONTEXT MATERIAL:
${unifiedChunk}

TARGET JSON SCHEMA FOR OUTPUT:
{
  "assessments": [
    {
      "concept_id": "MUST_MATCH_THE_INPUT_CONCEPT_ID_EXACTLY",
      "mcqs": [
        {
          "difficulty": "easy",
          "question_text": "Targeted easy question text based on video context?",
          "options": [
            {
              "option_text": "Distractor choice text",
              "is_correct": false,
              "explanation": "Concise detail on why this specific distractor fails based on the video."
            },
            {
              "option_text": "A randomly placed correct choice text",
              "is_correct": true,
              "explanation": "Clear, contextual proof confirming why this choice is explicitly correct."
            },
            {
              "option_text": "Distractor choice text",
              "is_correct": false,
              "explanation": "Concise detail on why this specific distractor fails based on the video."
            },
            {
              "option_text": "Distractor choice text",
              "is_correct": false,
              "explanation": "Concise detail on why this specific distractor fails based on the video."
            }
          ]
        },
        {
          "difficulty": "medium",
          "question_text": "Targeted medium application question text?",
          "options": [
            { "option_text": "...", "is_correct": false, "explanation": "..." },
            { "option_text": "...", "is_correct": false, "explanation": "..." },
            { "option_text": "...", "is_correct": false, "explanation": "..." },
            { "option_text": "...", "is_correct": true, "explanation": "..." }
          ]
        },
        {
          "difficulty": "hard",
          "question_text": "Targeted complex edge-case diagnostic question text?",
          "options": [
            { "option_text": "...", "is_correct": true, "explanation": "..." },
            { "option_text": "...", "is_correct": false, "explanation": "..." },
            { "option_text": "...", "is_correct": false, "explanation": "..." },
            { "option_text": "...", "is_correct": false, "explanation": "..." }
          ]
        }
      ],
      "flashcards": [
        {
          "front": "The primary core conceptual query or terminal prompt for the front?",
          "back": "The definitive explanatory summary text string for the back derived from the transcript."
        }
      ]
    }
  ]
}

REMINDER: You must return exactly 3 MCQs and exactly 1 flashcard entry object for EVERY single element in the target concepts array, sequentially. Randomize answer positions.`
            }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
    });
        const rawContent = completion.choices[0]?.message?.content;
        const parsedData = JSON.parse(rawContent);

        return{
            success: true,
            assessments: parsedData.assessments,
        };
    }catch(parseError){
        console.error("[ASSESSMENT BATCH ENGINE ERROR] JSON Payload parsing failed:", parseError);
        throw parseError;
    }
}