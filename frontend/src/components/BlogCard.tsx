import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useLike } from "../hooks";
import { CommentSection } from "./CommentSection";

interface BlogCardProps {
  authorName: string;
  content: string;
  publishedDate: string;
  id: number;
  likesCount: number;
  commentsCount: number;
  initialLiked: boolean;
}

export const BlogCard = ({
  authorName,
  content,
  publishedDate,
  id,
  likesCount,
  commentsCount,
  initialLiked
}: BlogCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(likesCount);
  const [isLiking, setIsLiking] = useState(false);
  const { toggleLike } = useLike();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLiking) return;
    setIsLiking(true);
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await toggleLike(id);
      setLiked(res.liked);
    } catch (err) {
      setLiked(liked);
      setLikeCount(likeCount);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors bg-white">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Avatar name={authorName} />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 text-sm mb-1">
            <span className="font-bold text-gray-900 truncate">{authorName}</span>
            <span className="text-gray-500">@{authorName.replace(/\s+/g, '').toLowerCase()}</span>
            <span className="text-gray-500 px-1">·</span>
            <span className="text-gray-500">{publishedDate}</span>
          </div>

          {/* Content */}
          <div 
            className="text-gray-900 text-[15px] leading-snug mb-3 line-clamp-5 overflow-hidden" 
            dangerouslySetInnerHTML={{ __html: content }} 
          />

          {/* Action Bar */}
          <div className="flex justify-between text-gray-500 max-w-md mt-3">
            <button 
              onClick={(e) => { e.preventDefault(); setShowComments(!showComments); }} 
              className="flex items-center gap-2 group transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-sm group-hover:text-blue-500">{commentsCount}</span>
            </button>
            
            <button 
              onClick={handleLike} 
              className="flex items-center gap-2 group transition-colors"
              disabled={isLiking}
            >
              <div className={`p-2 rounded-full group-hover:bg-pink-50 transition-colors ${liked ? "text-pink-600" : "group-hover:text-pink-600"}`}>
                <Heart className={`w-4 h-4 ${liked ? "fill-pink-600" : ""}`} />
              </div>
              <span className={`text-sm ${liked ? "text-pink-600" : "group-hover:text-pink-600"}`}>{likeCount}</span>
            </button>
            
            {/* Placeholder for Share/Retweet styling */}
            <div className="p-2"></div>
            <div className="p-2"></div>
          </div>

          {/* Inline Comments */}
          {showComments && (
            <div className="mt-4 border-t border-gray-100 pt-4" onClick={(e) => e.preventDefault()}>
              <CommentSection postId={id} initialComments={[]} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function Circle() {
  return <div className="h-1 w-1 rounded-full bg-slate-500"></div>;
}

export function Avatar({
  name,
  size = "small",
}: {
  name: string;
  size?: "small" | "big";
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-600 rounded-full ${
        size === "small" ? "w-6 h-6" : "w-10 h-10"
      }`}
    >
      <span
        className={`${
          size === "small" ? "text-xs" : "text-md"
        } font-extrabold text-gray-600 dark:text-gray-300`}
      >
        {name ? name[0].toUpperCase() : "?"}
      </span>
    </div>
  );
}
