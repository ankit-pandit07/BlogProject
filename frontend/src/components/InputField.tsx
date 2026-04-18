import { ChangeEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
    label: string;
    placeholder: string;
    type?: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

export const InputField = ({ label, placeholder, type = "text", value, onChange, error }: InputFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="mb-5">
            <label className="block mb-2 text-sm font-semibold text-gray-800">{label}</label>
            <div className="relative">
                <input 
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-3.5 rounded-xl border ${error ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-50'} bg-gray-50 focus:bg-white transition-all duration-200 outline-none focus:ring-4`}
                    placeholder={placeholder}
                />
                {isPassword && (
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <p className="mt-1.5 text-sm text-red-500 font-medium">{error}</p>}
        </div>
    );
}
