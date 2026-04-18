import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useSearch } from "../hooks/useSearch";
import { useNavigate } from "react-router-dom";

export const SearchBar = () => {
    const { query, setQuery, results, loading } = useSearch();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const stripHtml = (html: string) => {
        return html.replace(/<[^>]+>/g, '');
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md mx-4">
            <div className="relative flex items-center w-full h-10 rounded-full bg-gray-100 overflow-hidden px-4 focus-within:ring-2 focus-within:ring-slate-300 transition-shadow">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search posts or users..."
                    className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-500 h-full"
                />
                {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin absolute right-4" />}
            </div>

            {isOpen && query.trim() !== "" && (
                <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
                    {results.users.length === 0 && results.posts.length === 0 && !loading && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
                    )}

                    {results.users.length > 0 && (
                        <div className="mb-2">
                            <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Users</div>
                            {results.users.map(user => (
                                <div 
                                    key={`user-${user.id}`} 
                                    onClick={() => { setIsOpen(false); navigate(`/profile/${user.id}`); }}
                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{user.name[0]}</div>
                                    <span className="text-sm font-medium text-gray-800">{user.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {results.posts.length > 0 && (
                        <div>
                            <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Posts</div>
                            {results.posts.map(post => (
                                <div 
                                    key={`post-${post.id}`} 
                                    onClick={() => { setIsOpen(false); navigate(`/blog/${post.id}`); }}
                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="text-sm font-bold text-gray-800 truncate">{post.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{stripHtml(post.content)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
