
const cleanTranscript = (transcriptItem) => {
    try{
        if(!Array.isArray(transcriptItem) || transcriptItem.length == 0){
            return {success: false,data: null, error: "Empty or Invalid transcript"};       
        }
        let rawText = transcriptItem.map(item => item.text).join(" ");

        //Regex Text Sanitization
        const fillerWords = [
            "um", "uh", "er", "ah", "like", "well", "so", "actually",
            "basically", "literally", "really", "just", "okay", "ok",
            "right", "yeah", "yes", "no", "hmm", "you know",
            "i mean", "kind of", "sort of", "a little bit",
            "to be honest", "as you can see", "let me tell you", "you see"
        ];

        const regex = new RegExp(`\\b(${fillerWords.join("|")})\\b`, "gi");

        rawText = rawText.toLowerCase();                    
        rawText = rawText.replace(/\[[^\]]*\]/g, "");           //replacing sound artifacts like [Music],[Applause]
        rawText = rawText.replace(regex, "");                   //removing filler words
        rawText = rawText.replace(/\s+/g, " ");                 //replacing multiple white spaces with single ' '

        const cleanedText = rawText.trim();

        return {success: true,data: cleanedText,error: null};
    }catch(err){
        return {success: false,data: null, error: err.messege || "failed during text sanitization"};
    }
}

export function chunkText(text,chunkSize = 1200, chunkOverlap = 200){
    try{
        if(!text || typeof text != "string"){
            return {success:false,data: null,error: "Invalid text input."};
        }

        const chunks = [];
        let startIndex = 0;
        while(startIndex<text.length){
            let endIndex = startIndex + chunkSize;
            endIndex = Math.min(endIndex,text.length-1);
            let lastSpaceIndex = text.lastIndexOf(' ',endIndex);
            if(lastSpaceIndex == -1 || lastSpaceIndex<=startIndex){
                lastSpaceIndex = endIndex;
            }
            let chunkString = text.slice(startIndex,lastSpaceIndex).trim();
            if(chunkString.length>0){
                chunks.push(chunkString);
            }
            if(endIndex >= text.length) break;

            let nextStartIndex = lastSpaceIndex - chunkOverlap;
            
            if(nextStartIndex <= startIndex){
                startIndex = lastSpaceIndex+1;
            }
            else startIndex = nextStartIndex;
        }
        return {success:true, data: chunks, error: null};
    }catch(err){
        return {success:false, data: null, error: err.messege};
    }
}



// // ==========================================
// // 🧪 INTEGRATION TEST RUNNER
// // ==========================================
// function runPipelineTest() {
//     console.log("🚀 Launching Day 3-4 Pipeline Test...");
    
//     // 1. Mocking a chaotic, unformatted YouTube auto-caption payload array
//     const mockRawTranscript = [
//         { text: "welcome back everyone today we are talking about vector databases" },
//         { text: "um uh databases allow you to look up information semantically" },
//         { text: "so that you can build advanced LLM architectures like rag workflows" },
//         { text: "like you know it is super cool stuff literally like magic ok" }
//     ];

//     console.log("\n--- STEP 1: EXECUTING TRANSCRIPT CLEANER ---");
//     const cleanResult = cleanTranscript(mockRawTranscript);
    
//     if (!cleanResult.success) {
//         console.error("❌ Cleaner Failed:", cleanResult.error);
//         return;
//     }
//     console.log("✨ Cleaned Prose Output:", cleanResult.data);

//     console.log("\n--- STEP 2: EXECUTING SEMANTIC SLIDING WINDOW ---");
//     // We pass a hyper-small chunk size (50 characters) and overlap (15 characters)
//     // so we can force the sliding loop to trigger multiple times on a short text.
//     const chunkResult = chunkText(cleanResult.data, 50, 15);
    
//     if (!chunkResult.success) {
//         console.error("❌ Chunking Failed:", chunkResult.error);
//         return;
//     }

//     console.log("📊 Total Segments Generated:", chunkResult.data.length);
//     console.log("📦 Final Chunk Array Blueprint:");
//     console.log(JSON.stringify(chunkResult.data, null, 2));
// }

// // Execute the full pipeline test
// runPipelineTest();