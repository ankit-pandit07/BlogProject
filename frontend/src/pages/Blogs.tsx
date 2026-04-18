import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { useBlogs } from "../hooks";
import { Link, useLocation } from "react-router-dom";
import { Home, User } from "lucide-react";
import { useState, useEffect } from "react";

export const Blogs = () => {
  const { loading, blogs } = useBlogs();
  const location = useLocation();

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

  // Use the latest 3 blogs for the right sidebar
  const latestBlogs = blogs.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Appbar />
      
      <div className="flex justify-center max-w-7xl mx-auto w-full pt-6">
        {/* LEFT SIDEBAR (Desktop) */}
        <div className="hidden sm:block w-64 px-4 min-h-screen sticky top-24">
          <nav className="space-y-2">
            <Link to="/blogs">
                <SidebarItem icon={<Home />} label="Home" active={location.pathname === "/blogs"} />
            </Link>
            {currentUserId && (
                <Link to={`/profile/${currentUserId}`}>
                    <SidebarItem icon={<User />} label="Profile" active={location.pathname.startsWith("/profile")} />
                </Link>
            )}
          </nav>
        </div>

        {/* CENTER FEED */}
        <div className="w-full max-w-2xl min-h-screen pb-20 px-4">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Feed</h2>
            <p className="text-gray-500 mt-1">Discover the latest stories and insights.</p>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => <BlogSkeleton key={i} />)}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">Be the first to share your thoughts!</p>
              </div>
            ) : (
              blogs.map(blog => 
                <Link to={`/blog/${blog.id}`} key={blog.id} className="block transition-transform hover:-translate-y-1 duration-200">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <BlogCard
                        id={blog.id}
                        title={blog.title || "Untitled"}
                        authorName={blog.author.name || "Anonymous"}
                        content={blog.content}
                        publishedDate={"Just now"}
                        likesCount={blog._count?.likes || 0}
                        commentsCount={blog._count?.comments || 0}
                        initialLiked={blog.likes?.some(l => l.userId === currentUserId) || false}
                      />
                  </div>
                </Link>
              )
            )}
          </div>
        </div>

        {/* RIGHT PANEL (Desktop) */}
        <div className="hidden lg:block w-80 px-6 sticky top-24 h-max">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 mb-4 tracking-tight">Latest Posts</h3>
            {loading ? (
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                </div>
            ) : latestBlogs.length === 0 ? (
                <p className="text-gray-500 text-sm">Nothing to see here.</p>
            ) : (
                <div className="space-y-5">
                    {latestBlogs.map(blog => (
                        <Link to={`/blog/${blog.id}`} key={blog.id} className="block group">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {blog.title || "Untitled Post"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                By {blog.author.name || "Anonymous"}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={`flex items-center gap-4 p-3 rounded-xl transition-all w-full ${active ? "bg-gray-900 text-white shadow-md" : "hover:bg-white hover:shadow-sm text-gray-600"}`}>
    <div className={active ? "text-white" : "text-gray-500"}>{icon}</div>
    <span className={`text-lg hidden xl:block ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
  </button>
);

export const BlogSkeleton = () => {
    return <div role="status" className="animate-pulse flex flex-col gap-3 p-6 bg-white rounded-2xl border border-gray-100 w-full">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded-full w-24"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mt-2"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
        <div className="h-8 bg-gray-200 rounded-full w-24 mt-4"></div>
        <span className="sr-only">Loading...</span>
    </div>
}
