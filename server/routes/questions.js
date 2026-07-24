import {Router} from "express";
import {requireAuth} from "../middleware/authMiddleware.js";

import { selectNextQuestion } from "../services/adaptiveEngine.js";
import { submitAnswer } from "../services/submitAnswer.js";

const router = Router();

router.get("/adaptive-next",reqAuth,async (req,res)=>{
    try{
        const {videoId} = req.query;
        const userId = req.user?.id;
        if(!videoId){
            return res.status(400).json({
                success: false,
                message: "Missing videoId field,videoId parameter is required!"
            });
        }

        if(!userId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized User"
            });
        }

        const nextQues = await selectNextQuestion(userId,videoId);
        if(!nextQues){
            return res.status(400).json({
                success:true,
                completed:true,
                message:"Completed all the ques for this video!"
            });
        }
        return res.status(200).json({
            success: true,
            completed: false,
            data: nextQues
        });
    }catch(error){
        console.error("GET /adaptive-next route crashed",error.stack);

        return res.status(500).json({
            success:false,
            message:"Internal server error running the adaptive algorithm selection matrix",
            error: error.message
        })
    }
});

router.post("/submit-choice",reqAuth,async (req,res) =>{
    try{
        const {questionId,selectedOption} = req.body;
        const userId = req.user?.id;

        if(!questionId || selectedOption == null || selectedOption == undefined){
            return res.status(400).json({
                success: false,
                message: "Missing body fields: Both questionId and selectedOptionIndex are mandatory."
            });
        }

        if(!userId){
            return res.status(400).json({
                success: false,
                message: "Unauthorized User"
            });
        }

        const evaluation = await submitAnswer(userId,questionId,selectedOption);

        return res.status(200).json(evaluation);
    }catch(err){
        console.error("POST /submit-next crashed",err.stack);

        return res.status(500).json({
            success:false,
            message:"Backend Error, answer submission route crashed!",
            error: err.message
        });
    }
});

export default router;