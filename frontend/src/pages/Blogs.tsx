import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { PostComposer } from "../components/PostComposer";
import { useBlogs } from "../hooks";
import { Link } from "react-router-dom";
import { Home, User, Bell, Mail, Search } from "lucide-react";
import { useState, useEffect } from "react";

export const Blogs = () => {
  const { loading, blogs } = useBlogs();
  const [refreshKey, setRefreshKey] = useState(0);

  // Force re-render feed on new post (in real app, append to state)
  const handlePostCreated = () => {
      window.location.reload();
  };

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
          try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              setCurrentUserId(payload.id);
          } catch(e) {}
      }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Appbar />
      
      <div className="flex justify-center max-w-7xl mx-auto w-full">
        {/* LEFT SIDEBAR (Desktop) */}
        <div className="hidden sm:block w-64 px-4 py-6 border-r border-gray-100 min-h-screen sticky top-16">
          <nav className="space-y-2">
            <SidebarItem icon={<Home />} label="Home" active />
            <SidebarItem icon={<Search />} label="Explore" />
            <SidebarItem icon={<Bell />} label="Notifications" />
            <SidebarItem icon={<Mail />} label="Messages" />
            <SidebarItem icon={<User />} label="Profile" />
          </nav>
        </div>

        {/* CENTER FEED */}
        <div className="w-full max-w-2xl border-r border-gray-100 min-h-screen pb-20">
          <div className="sticky top-16 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 p-4">
            <h2 className="text-xl font-bold">Home</h2>
          </div>
          
          <PostComposer onPostCreated={handlePostCreated} />

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => <BlogSkeleton key={i} />)}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center pt-20 text-gray-500 font-semibold text-lg">
                No posts yet. Be the first to share what's happening!
              </div>
            ) : (
              blogs.map(blog => 
                <Link to={`/blog/${blog.id}`} key={blog.id} className="block">
                  <BlogCard
                    id={blog.id}
                    authorName={blog.author.name || "Anonymous"}
                    content={blog.content}
                    publishedDate={"Just now"}
                    likesCount={blog._count?.likes || 0}
                    commentsCount={blog._count?.comments || 0}
                    initialLiked={blog.likes?.some(l => l.userId === currentUserId) || false}
                  />
                </Link>
              )
            )}
          </div>
        </div>

        {/* RIGHT PANEL (Desktop) */}
        <div className="hidden lg:block w-80 px-6 py-6 sticky top-16 h-screen">
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-bold text-xl mb-4">What's happening</h3>
            <TrendingItem category="Technology" topic="React 19" posts="42.1K" />
            <TrendingItem category="Frameworks" topic="Next.js vs Vite" posts="12.5K" />
            <TrendingItem category="Design" topic="TailwindCSS" posts="8,204" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={`flex items-center gap-4 p-3 rounded-full hover:bg-gray-100 transition-colors w-full ${active ? "font-bold" : "font-medium"}`}>
    <div className={active ? "text-black" : "text-gray-800"}>{icon}</div>
    <span className="text-xl hidden xl:block">{label}</span>
  </button>
);

const TrendingItem = ({ category, topic, posts }: { category: string, topic: string, posts: string }) => (
  <div className="mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-xl transition-colors">
    <p className="text-xs text-gray-500 font-medium">{category}</p>
    <p className="font-bold text-gray-900">{topic}</p>
    <p className="text-xs text-gray-500">{posts} posts</p>
  </div>
);

export const BlogSkeleton = () => {
    return <div role="status" className="animate-pulse flex flex-col gap-2 p-4 border-b border-slate-200 pb-4 w-full cursor-pointer">
        <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded-full mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full mb-2.5 w-24"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded-full mb-2.5 w-full"></div>
        <div className="h-2 bg-gray-200 rounded-full mb-2.5 w-1/2"></div>
        <div className="h-2 bg-gray-200 rounded-full mb-2.5 w-20 mt-4"></div>
        <span className="sr-only">Loading...</span>
    </div>
}
