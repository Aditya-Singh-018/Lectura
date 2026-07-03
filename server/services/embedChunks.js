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

        return {success:true, data:data, error:null};
    }catch(err){
        return {success:false, data:null, error: err.message};
    }
}
