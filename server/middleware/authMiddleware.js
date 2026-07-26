import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client using Service Role Key for token verification
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function reqAuth(req, res, next){
    try{
        //Extracting authorization headers
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startswith('Bearer ')){
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Missing or malformed Bearer token.'
            });
        }

        //Extracting the raw JWT bearer token
        const token = authHeader.split(' ')[1];     //Bearer abc123xyz we are extracting the token at index 1 after split

        if(!token){
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Access token not found.'
            });
        }

        //Verifying the JWT token with supabase authority
        //token is send by frontend and supabase verifies it whether the user really exists or not?
        const {data:{user},error} = await supabase.auth.getUser(token);

        if(error || !user){
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid or expired access token.',
                error: error?.message
            });
        }

        //Attaching the authenticated user to express object
        req.user = user;

        //Passing control to the next handler route
        next(); //Passing execution to next middleware
    }catch(error){
        console.error('[AUTH MIDDLEWARE CRASH]:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error verifying user authorization.',
            error: err.message
        });
    }
}