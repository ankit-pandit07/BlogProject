import { useState } from "react";
import { Heart } from "lucide-react";
import { useLike } from "../hooks";

export const LikeButton = ({ postId, initialCount, initialLiked }: { postId: number, initialCount: number, initialLiked: boolean }) => {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [isLoading, setIsLoading] = useState(false);
    const { toggleLike } = useLike();

    const handleToggle = async () => {
        if (isLoading) return;
        setIsLoading(true);
        // Optimistic UI update
        setLiked(!liked);
        setCount(liked ? count - 1 : count + 1);

        try {
            const res = await toggleLike(postId);
            // Sync with actual server response just in case
            setLiked(res.liked);
        } catch (e) {
            // Revert on failure
            setLiked(liked);
            setCount(count);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={handleToggle} 
            className="flex items-center gap-2 group focus:outline-none"
            disabled={isLoading}
        >
            <Heart 
                className={`w-6 h-6 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-500 group-hover:text-red-500"}`} 
            />
            <span className={`font-medium ${liked ? "text-red-500" : "text-gray-500"}`}>{count}</span>
        </button>
    );
};
