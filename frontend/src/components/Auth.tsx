import { signupInput } from "@ankitpandit/medium-common"
import axios from "axios";
import { ChangeEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BACKEND_URL } from "../config";


export const Auth = ({type}:{type:"signup" | "signin"}) => {
    const navigate=useNavigate();
    const [postInputs, SetpostInputs]=useState<signupInput>({
        name:"",
        email:"",
        password:""
    });
    const [error, setError] = useState<string | null>(null);
     
    async function sendFunction(){
        try {
            setError(null);
            console.log("1. Sending auth request to backend...");
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/${type==="signup" ? "signup" : "signin"}`, postInputs);
            
            console.log("2. API Response Data:", response.data);
            
            // Robustly handle both { jwt: "..." } and raw string formats
            const jwt = response.data.jwt || response.data;
            console.log("3. Extracted JWT:", jwt);

            if (!jwt || typeof jwt !== "string" || jwt.trim() === "" || jwt === "undefined") {
                setError("Failed to retrieve authentication token. Invalid format.");
                return;
            }

            // Store the RAW token (without Bearer prefix) to prevent double-prefixing
            localStorage.setItem("token", jwt.replace("Bearer ", ""));
            console.log("4. Token stored in localStorage:", localStorage.getItem("token"));
            
            console.log("5. Navigating to /blogs");
            navigate("/blogs");
            
        } catch (e: any) {
            console.error("Auth Error:", e);
            setError(e.response?.data?.message || "An error occurred during authentication.");
        }
    }

  return (
    <div className="h-screen flex justify-center flex-col">
        <div className="flex justify-center">
            <div>
                <div className="px-10">
                    <div className="text-3xl font-extrabold">
                        Create an Account

                    </div>
                    <div className="text-slate-500">
                        {type === "signin" ? "Don't have an account?" : "Already have an account?"}
                        <Link className="pl-2 underline" to={type === "signin" ? "/signup" : "/signin"}>
                            {type === "signin" ? "Sign up" : "Sign in"}
                        </Link>
                    </div>
                </div>
            <div className="pt-8">
            {error && <div className="text-red-500 text-sm font-semibold mb-4 text-center">{error}</div>}
            {type==="signup"?<LabelledInput label="Name" placeholder="Enter your name.." onChange={(e)=>{
                SetpostInputs({
                    ...postInputs,
                    name:e.target.value
                })
            }}/>:null}
            <LabelledInput label="Email" placeholder="Ankit@gmail.com" onChange={(e)=>{
                SetpostInputs({
                    ...postInputs,
                    email:e.target.value
                })
            }}/>
            <LabelledInput label="Password" type="password" placeholder="Enter your password" onChange={(e)=>{
                SetpostInputs({
                    ...postInputs,
                    password:e.target.value
                })
            }}/>
            <button onClick={sendFunction} type="button" className="mt-8 w-full text-white-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700">{type==="signup"?"Sign up":"Sign in"}</button>
            </div>
        </div>
    </div>
    </div>
  )
}
interface LabelledInputType{
    label:string;
    placeholder:string;
    onChange:(e:ChangeEvent<HTMLInputElement>)=>void;
    type?:string;
 }

function LabelledInput({label,placeholder,onChange,type}:LabelledInputType){
    const inputId = label.replace(/\s+/g, '-').toLowerCase();
    return <div>
        <label htmlFor={inputId} className="block mb-2 text-sm text-black font-semibold pt-4">{label}</label>
        <input onChange={onChange} type={type || "text"} id={inputId} className="bg-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder={placeholder} required/>
    </div>
}