import { useState } from "react";
import { useComments, Comment } from "../hooks";
import { ConfirmModal } from "./ConfirmModal";
import { Toast } from "./Toast";

export const CommentSection = ({ postId, initialComments = [], currentUserId, blogAuthorId }: { postId: number, initialComments: Comment[], currentUserId?: number | null, blogAuthorId?: number }) => {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addComment, deleteComment } = useComments();

    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error">("error");

    const confirmDelete = async () => {
        if (!commentToDelete) return;
        try {
            await deleteComment(postId, commentToDelete);
            setComments(comments.filter(c => c.id !== commentToDelete));
            setToastMessage("Comment deleted successfully.");
            setToastType("success");
        } catch (e) {
            setToastMessage("Failed to delete comment.");
            setToastType("error");
        } finally {
            setCommentToDelete(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const newComment = await addComment(postId, content);
            setComments([newComment, ...comments]);
            setContent("");
            setToastMessage("Comment added successfully.");
            setToastType("success");
        } catch (e) {
            setToastMessage("Failed to add comment.");
            setToastType("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-12 border-t pt-8">
            <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>
            
            <form onSubmit={handleSubmit} className="mb-8">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                    rows={3}
                />
                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="bg-green-600 text-white px-5 py-2 rounded-full font-medium hover:bg-green-700 disabled:opacity-50 transition"
                    >
                        {isSubmitting ? "Posting..." : "Post Comment"}
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="border-b pb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                                    {comment.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{comment.user.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-gray-800 ml-10 flex-1">{comment.content}</p>
                                {currentUserId && (currentUserId === comment.userId || currentUserId === blogAuthorId) && (
                                    <button 
                                        onClick={() => setCommentToDelete(comment.id)}
                                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                        title="Delete comment"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <ConfirmModal 
                isOpen={commentToDelete !== null} 
                onClose={() => setCommentToDelete(null)} 
                onConfirm={confirmDelete}
                title="Delete Comment"
                message="Are you sure you want to delete this comment?"
            />
            
            <Toast 
                message={toastMessage} 
                type={toastType} 
                onClose={() => setToastMessage(null)} 
            />
        </div>
    );
};
