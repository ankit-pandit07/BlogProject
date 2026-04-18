import { useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const Toast = ({ message, type = "error", onClose }: { message: string | null, type?: "success" | "error", onClose: () => void }) => {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl font-medium transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 ${type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
            {type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            {message}
        </div>
    );
}
