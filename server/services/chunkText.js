
export function cleanTranscript(transcriptItem){
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
