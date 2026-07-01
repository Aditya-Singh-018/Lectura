import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });


export async function embedChunks(chunks){  //if inside any fn is async then overall fn will be async
    try{
        if(!Array.isArray(chunks) || chunks.length == 0){
            return {success: false,data: null, error: "Chunks array Invalid or empty"};       
        }

        let baseModelUrl = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";
        let headers = {"Content-Type":"application/json","Authorization": `Bearer ${process.env.HF_API_KEY}`};
        
        if(!process.env.HF_API_KEY){
            return{ success: false, data: null, error: "Critical Error: HF_API_KEY is missing from environment variables."};
        }

        let res= await fetch(baseModelUrl,{
                method: "POST",
                headers: headers,
                body: JSON.stringify({inputs: chunks}),     //Network protocols can only transmit text strings
                signal: AbortSignal.timeout(30000) // 30-second timeout guard
            }
        );
        
        if (!res.ok){
            return { success: false, data: null, error: `Hugging Face API Error: ${res.status} ${res.statusText}` };
        }

        let data = await res.json();
        console.log(data.length);
        console.log(data[0].length);

        return {success:true, data:data, error:null};
    }catch(err){
        return {success:false, data:null, error: err.message};
    }
}


// ==========================================
// 🧪 HUGGING FACE INFERENCE PIPELINE TEST
// ==========================================
async function runDay5Test() {
    console.log("📡 Initializing Hugging Face Vector Pipeline...");

    // Simulating two semantic chunks generated from Day 3-4 splitting logic
    const mockChunks = [
        "vector embeddings allow backend databases to store semantic meaning rather than plain text strings",
        "postgresql uses the pgvector extension to run low latency dot product and cosine similarity searches"
    ];

    console.log("Sending text chunks to all-MiniLM-L6-v2 model layers...");
    const result = await embedChunks(mockChunks);

    if (!result.success) {
        console.error("❌ Vector Generation Failed:", result.error);
        
        // Helpful tip for initial Hugging Face connection spikes
        if (result.error && result.error.includes("503")) {
            console.log("💡 Tip: Hugging Face takes 20-30 seconds to download free models into VRAM on the first request. Wait a moment and run it again!");
        }
        return;
    }

    console.log("\n--- ✅ MODEL EXECUTION SUCCESSFUL ---");
    console.log("Total Vector Records Returned (Should be 2):", result.data.length);
    console.log("Vector Coordinates Per Chunk (Should be 384):", result.data[0].length);
    
    console.log("\n📊 Sample Coordinate Matrix Preview (First 5 Dimensions of Chunk 1):");
    console.log(result.data[0].slice(0, 5), "... followed by 379 more dimensions!");
}

// Execute the embedding test
runDay5Test();