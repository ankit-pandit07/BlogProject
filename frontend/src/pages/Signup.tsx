import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { AuthLayout } from "../components/AuthLayout";
import { AuthCard } from "../components/AuthCard";
import { InputField } from "../components/InputField";
import { Loader2 } from "lucide-react";
import { Toast } from "../components/Toast";

export const Signup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Calculate password strength (0-4)
    const strength = useMemo(() => {
        let score = 0;
        if (!password) return 0;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        return score;
    }, [password]);

    const strengthColors = ["bg-gray-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !password) {
            setToastMessage("Email and password are required");
            return;
        }
        
        if (password !== confirmPassword) {
            setToastMessage("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setToastMessage("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, { name, email, password });
            const jwt = response.data.jwt || response.data;
            if (jwt && typeof jwt === "string") {
                localStorage.setItem("token", jwt.replace("Bearer ", ""));
                navigate("/blogs");
            }
        } catch (e: any) {
            setToastMessage(e.response?.data?.message || "Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Join Us" subtitle="Create an account to start publishing">
            <AuthCard>
                <form onSubmit={handleSignup}>
                    <InputField 
                        label="Full Name" 
                        placeholder="John Doe" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                    />
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
                    
                    {password && (
                        <div className="mb-5 -mt-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-500">Password strength</span>
                                <span className={`text-xs font-bold ${strength === 4 ? 'text-green-600' : 'text-gray-600'}`}>
                                    {strengthLabels[strength]}
                                </span>
                            </div>
                            <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                {[1, 2, 3, 4].map((level) => (
                                    <div 
                                        key={level} 
                                        className={`flex-1 transition-colors duration-300 ${strength >= level ? strengthColors[strength] : 'bg-transparent'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <InputField 
                        label="Confirm Password" 
                        placeholder="••••••••" 
                        type="password"
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 font-medium">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline underline-offset-2 transition-colors">
                        Sign in
                    </Link>
                </p>
            </AuthCard>
            <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
        </AuthLayout>
    );
};
