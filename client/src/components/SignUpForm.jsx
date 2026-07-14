import { useState } from "react";
import { supabase } from "../supabaseClient";

function SignUpForm(){
    const [formData,setFormData] = useState({email:"",username:"",password:""});

    const handleInputChange = (event) =>{
        let fieldName = event.target.name;
        let newVal = event.target.value;

        setFormData((currData) => { //currData => current form data (i.e. the formData obj)
            return {...currData,[fieldName]:newVal};   //need to spread,this is the correct way never mutate old states
        });
    }

    const handleSubmit = async (event) =>{
        event.preventDefault();
        console.log(formData);
            const { data, error } = await supabase.auth.updateUser({
            email: formData.email,
            password: formData.password,
            data: { username: formData.username } // Custom user metadata array shard
            });
        setFormData({           //resetted to trigger a state change after submit and be ready for next input
            email:"",
            username:"",
            password:"",
        })
    }

    return(
        <form onSubmit={handleSubmit}>
            <label htmlFor="email">Enter email</label>
            <input id="email" placeholder="Enter email" type="text" value={formData.email} onChange={handleInputChange} name="email"/>
            <br/><br/>
            <label htmlFor="username">Username</label>
            <input id="username" name="username" value={formData.username} onChange={handleInputChange} />    
            <br/><br/>
            <label htmlFor="password">Password</label>
            <input id="password" placeholder="Enter password" type="password" value={formData.password} onChange={handleInputChange} name="password"/>
            <button>Submit</button>
        </form>
    );
}