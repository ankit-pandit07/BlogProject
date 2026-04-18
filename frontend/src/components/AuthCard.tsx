import { ReactNode } from "react";

export const AuthCard = ({ children }: { children: ReactNode }) => {
    return (
        <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-white">
            {children}
        </div>
    );
}
