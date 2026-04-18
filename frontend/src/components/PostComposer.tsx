import { useState, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { ImagePlus, Loader2 } from "lucide-react";

export const PostComposer = ({ onPostCreated }: { onPostCreated: () => void }) => {
    const [content, setContent] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePost = async () => {
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            await axios.post(`${BACKEND_URL}/api/v1/blog`, {
                title: content.substring(0, 30) + (content.length > 30 ? "..." : ""), // Generate fake title for backend compat
                content
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setContent("");
            onPostCreated();
        } catch (e) {
            console.error("Failed to post", e);
            alert("Failed to create post");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "iirmyaoc");

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || prompt("Please enter your Cloudinary Cloud Name:");
        if (!cloudName) {
            alert("Cloudinary cloud name required");
            setIsUploading(false);
            return;
        }

        try {
            const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
            const imageUrl = res.data.secure_url;
            // Append image markdown/html directly to content
            setContent(prev => prev + `\n<img src="${imageUrl}" alt="Uploaded Image" class="rounded-2xl mt-4 w-full max-h-96 object-cover" />`);
        } catch (err) {
            console.error("Image upload failed", err);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex gap-4 p-4 border-b border-gray-100 bg-white">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div>
            <div className="flex-1">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What is happening?!"
                    className="w-full text-xl resize-none outline-none placeholder-gray-500 py-2"
                    rows={content.split('\n').length > 2 ? content.split('\n').length : 2}
                />
                
                {/* Visual rendering of raw HTML in preview if needed, but for simplicity we rely on text input */}
                
                <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-2">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isSubmitting}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                    <button
                        onClick={handlePost}
                        disabled={!content.trim() || isSubmitting}
                        className="bg-blue-500 text-white font-bold py-1.5 px-5 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:bg-blue-300"
                    >
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
};
