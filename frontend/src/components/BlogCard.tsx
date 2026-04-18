import { useState } from "react";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { useLike } from "../hooks";

interface BlogCardProps {
  authorName: string;
  title: string;
  content: string;
  publishedDate: string;
  id: number;
  likesCount: number;
  commentsCount: number;
  initialLiked: boolean;
}

export const BlogCard = ({
  authorName,
  title,
  content,
  publishedDate,
  id,
  likesCount,
  commentsCount,
  initialLiked
}: BlogCardProps) => {
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

  // Strip HTML tags for the preview content
  const plainTextContent = content.replace(/<[^>]+>/g, '');

  return (
    <div className="p-6 bg-white transition-colors cursor-pointer w-full">
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={authorName} />
        <div className="flex items-center text-sm">
            <span className="font-semibold text-gray-900">{authorName}</span>
            <span className="mx-2 text-gray-400">·</span>
            <span className="text-gray-500 font-medium">{publishedDate}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight tracking-tight line-clamp-2">
            {title}
        </h2>
        <p className="text-gray-600 text-[15px] leading-relaxed line-clamp-3 font-serif">
            {plainTextContent}
        </p>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike} 
            className="flex items-center gap-2 group transition-colors"
            disabled={isLiking}
          >
            <Heart className={`w-5 h-5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-500"}`} />
            <span className={`text-sm font-medium ${liked ? "text-red-500" : "text-gray-500 group-hover:text-red-500"}`}>{likeCount}</span>
          </button>

          <div className="flex items-center gap-2 text-gray-400 group hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
            <span className="text-sm font-medium group-hover:text-blue-500">{commentsCount}</span>
          </div>
        </div>
        
        <div className="text-gray-400 hover:text-gray-900 transition-colors">
            <Bookmark className="w-5 h-5" />
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
