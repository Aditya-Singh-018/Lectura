import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function LoginForm({onNavigate}){
    const [formData,setFormData] = useState({email:"",password:""});
    const [errorMessage,setErrorMessage] = useState(null);

    const handleInputChange = (event) =>{
        let fieldName = event.target.name;
        let newVal = event.target.value;

        setFormData((currData) => { //currData => current form data (i.e. the formData obj)
            return {...currData,[fieldName]:newVal};   //need to spread,this is the correct way never mutate old states
        });
    }

    const handleSubmit = async (event) =>{
        event.preventDefault();
        setErrorMessage(null);
        console.log(formData);
            const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
            });
        
        if(error){
            setErrorMessage(error.message);
        }else{
            console.log("Login Successful");
            onNavigate('ingest');
        }
        setFormData({           //resetted to trigger a state change after submit and be ready for next input
            email:"",
            password:"",
        });
    }

    return(
        <>
        <div className="mb-8">
        <div className="flex items-center gap-6 mb-1">
            <button
            onClick={() => onNavigate('signup')}
            className="text-base font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
            Sign up
            </button>
            <button
            className="text-base font-bold text-slate-900 border-b-2 border-blue-600 pb-1 cursor-default"
            >
            Log in
            </button>
        </div>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="space-y-5">
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">Enter email</label>
                <input className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                text-slate-900 placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors" id="email" placeholder="you@example.com" type="text" value={formData.email} onChange={handleInputChange} name="email"/>
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">Password</label>
                <input className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                text-slate-900 placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors" id="password" placeholder="Enter your password" type="password" value={formData.password} onChange={handleInputChange} name="password"/>
                </div>
            </div>
            <button className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700
            text-white font-semibold rounded-xl
            transition-colors duration-200 shadow-sm cursor-pointer">Log In</button>
            {errorMessage && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg mt-3">{errorMessage}</p>
            )}
        </form>
        <p className="text-sm text-slate-500 text-center mt-6">
        Don't have an account?{' '}
        <button
            onClick={() => onNavigate('signup')}
            className="text-blue-600 font-semibold hover:underline cursor-pointer"
        >
            Sign up
        </button>
        </p>
        </>
    );
}