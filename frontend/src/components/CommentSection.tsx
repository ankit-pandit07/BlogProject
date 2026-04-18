import { useState } from "react";
import { useComments, Comment } from "../hooks";

export const CommentSection = ({ postId, initialComments = [] }: { postId: number, initialComments: Comment[] }) => {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addComment } = useComments();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const newComment = await addComment(postId, content);
            setComments([newComment, ...comments]);
            setContent("");
        } catch (e) {
            alert("Failed to add comment.");
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
                            <p className="text-gray-800 ml-10">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
