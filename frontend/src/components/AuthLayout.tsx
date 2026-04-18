import { ReactNode } from "react";

export const AuthLayout = ({ children, title, subtitle }: { children: ReactNode, title: string, subtitle: string }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4 selection:bg-blue-100">
            <div className="w-full max-w-md animate-in slide-in-from-bottom-4 fade-in duration-700 ease-out">
                <div className="text-center mb-10">
                    <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-8 shadow-xl shadow-black/10 hover:scale-105 transition-transform">
                        M
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">{title}</h1>
                    <p className="text-gray-500 font-medium text-lg">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
}
