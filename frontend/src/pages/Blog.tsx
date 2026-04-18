import { useNavigate, useParams, Link } from "react-router-dom";
import { useBlog } from "../hooks";
import { Appbar } from "../components/Appbar";
import { LikeButton } from "../components/LikeButton";
import { CommentSection } from "../components/CommentSection";
import { Avatar } from "../components/BlogCard";
import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { ConfirmModal } from "../components/ConfirmModal";
import { Toast } from "../components/Toast";

export const Blog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loading, blog } = useBlog({
        id: id || ""
    });

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error">("error");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.id);
            } catch(e) {}
        }
    }, []);

    const confirmDelete = async () => {
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/blog/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            navigate("/blogs");
        } catch(e) {
            setToastMessage("Failed to delete blog");
            setToastType("error");
        }
    }

    if (loading || !blog) {
        return <div className="min-h-screen bg-gray-50">
            <Appbar />
            <div className="flex justify-center mt-16 px-4">
                <div className="w-full max-w-[700px]">
                    <div className="animate-pulse flex flex-col gap-4">
                        <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                    </div>
                </div>
            </div>
        </div>
    }

    return <div className="min-h-screen bg-white">
        <Appbar />
        <div className="flex justify-center px-4 sm:px-6">
            <div className="w-full max-w-[700px] pt-12 pb-24">
                
                {/* Title */}
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-8 break-words">
                    {blog.title}
                </h1>

                {/* Author Info & Actions Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                        <Avatar name={blog.author.name || "Anonymous"} size="big" />
                        <div>
                            <div className="text-lg font-bold text-gray-900">{blog.author.name || "Anonymous"}</div>
                            <div className="text-sm text-gray-500 font-medium">Published on Feb 2, 2024 · 5 min read</div>
                        </div>
                    </div>

                    {currentUserId === blog.authorId && (
                        <div className="flex gap-2">
                            <Link to={`/edit/${blog.id}`}>
                                <button className="text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold rounded-full text-sm px-5 py-2 transition-colors">Edit</button>
                            </Link>
                            <button onClick={() => setIsDeleteModalOpen(true)} className="text-red-600 bg-red-50 hover:bg-red-100 font-semibold rounded-full text-sm px-5 py-2 transition-colors">Delete</button>
                        </div>
                    )}
                </div>
                
                {/* Content */}
                <article 
                    className="prose prose-lg sm:prose-xl max-w-none text-gray-800 leading-relaxed font-serif tracking-wide" 
                    dangerouslySetInnerHTML={{ __html: blog.content }} 
                />
                
                {/* Action Bar */}
                <div className="mt-12 py-4 border-t border-b border-gray-100 flex items-center gap-8">
                    <LikeButton 
                        postId={blog.id} 
                        initialCount={blog._count?.likes || 0} 
                        initialLiked={blog.likes?.some(l => l.userId === currentUserId) || false} 
                    />
                    <div className="flex items-center gap-2 text-gray-500 hover:text-gray-800 cursor-pointer transition-colors group">
                        <svg className="w-6 h-6 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <span className="font-medium">{blog._count?.comments || 0}</span>
                    </div>
                    {/* Optional Bookmark Icon */}
                    <div className="ml-auto text-gray-400 hover:text-gray-800 cursor-pointer transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-10">
                    <CommentSection 
                        postId={blog.id} 
                        initialComments={blog.comments || []} 
                        currentUserId={currentUserId}
                        blogAuthorId={blog.authorId}
                    />
                </div>

            </div>
        </div>

        <ConfirmModal 
            isOpen={isDeleteModalOpen} 
            onClose={() => setIsDeleteModalOpen(false)} 
            onConfirm={confirmDelete}
            title="Delete Blog"
            message="Are you sure you want to delete this blog? This action cannot be undone."
        />
        
        <Toast 
            message={toastMessage} 
            type={toastType} 
            onClose={() => setToastMessage(null)} 
        />
    </div>
}