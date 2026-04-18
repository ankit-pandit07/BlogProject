import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { AuthLayout } from "../components/AuthLayout";
import { AuthCard } from "../components/AuthCard";
import { InputField } from "../components/InputField";
import { Loader2 } from "lucide-react";
import { Toast } from "../components/Toast";

export const Signin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleSignin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setToastMessage("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, { email, password });
            const jwt = response.data.jwt || response.data;
            if (jwt && typeof jwt === "string") {
                localStorage.setItem("token", jwt.replace("Bearer ", ""));
                navigate("/blogs");
            }
        } catch (e: any) {
            setToastMessage(e.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue">
            <AuthCard>
                <form onSubmit={handleSignin}>
                    <InputField 
                        label="Email Address" 
                        placeholder="you@example.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                    <InputField 
                        label="Password" 
                        placeholder="••••••••" 
                        type="password"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full mt-6 bg-gradient-to-r from-gray-900 to-black text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in to account"}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 font-medium">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline underline-offset-2 transition-colors">
                        Create one now
                    </Link>
                </p>
            </AuthCard>
            <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
        </AuthLayout>
    );
};