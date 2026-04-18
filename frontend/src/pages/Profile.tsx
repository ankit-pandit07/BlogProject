import { useParams, Link } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { useProfile } from "../hooks";
import { useState, useEffect } from "react";
import { Toast } from "../components/Toast";
import { timeAgo } from "../utils/timeAgo";

export const Profile = () => {
    const { id } = useParams();
    const { loading, profile, updateProfile } = useProfile({ id: id || "" });
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error">("error");
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

    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setBio(profile.bio || "");
        }
    }, [profile]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile({ name, bio });
            setToastMessage("Profile updated successfully");
            setToastType("success");
            setIsEditing(false);
        } catch (e) {
            setToastMessage("Failed to update profile");
            setToastType("error");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-50">
            <Appbar />
            <div className="flex justify-center mt-20">
                <div className="animate-pulse text-xl text-gray-500 font-medium">Loading profile...</div>
            </div>
        </div>
    }

    if (!profile) {
        return <div className="min-h-screen bg-gray-50">
            <Appbar />
            <div className="flex justify-center mt-20">
                <div className="text-2xl font-bold text-gray-800">User not found</div>
            </div>
        </div>
    }

    const isOwner = currentUserId === profile.id;

    return (
        <div className="min-h-screen bg-gray-50">
            <Appbar />
            <div className="flex justify-center px-4 sm:px-6">
                <div className="w-full max-w-[800px] pt-12 pb-24">
                    
                    {/* Profile Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold uppercase shrink-0">
                                {profile.avatar ? <img src={profile.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" /> : (profile.name ? profile.name[0] : "U")}
                            </div>
                            
                            <div className="flex-1 text-center sm:text-left w-full">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <input 
                                            type="text" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)} 
                                            placeholder="Your Name"
                                            className="w-full text-2xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-blue-500 pb-1 bg-transparent outline-none"
                                        />
                                        <textarea 
                                            value={bio} 
                                            onChange={(e) => setBio(e.target.value)} 
                                            placeholder="Tell us about yourself..."
                                            rows={3}
                                            className="w-full text-gray-600 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        />
                                        <div className="flex gap-3 justify-center sm:justify-start">
                                            <button 
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="px-4 py-2 text-white bg-black hover:bg-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                                            >
                                                {isSaving ? "Saving..." : "Save Profile"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                            <h1 className="text-3xl font-extrabold text-gray-900">{profile.name || "Anonymous"}</h1>
                                            {isOwner && (
                                                <button 
                                                    onClick={() => setIsEditing(true)}
                                                    className="px-4 py-1.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                                                >
                                                    Edit Profile
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-500 mb-4">{profile.email}</p>
                                        <p className="text-gray-700 leading-relaxed max-w-2xl">{profile.bio || "No bio yet."}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-8 mt-8 pt-6 border-t border-gray-100">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{profile._count.posts}</div>
                                <div className="text-sm font-medium text-gray-500">Blogs</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{profile.totalLikesReceived}</div>
                                <div className="text-sm font-medium text-gray-500">Likes Received</div>
                            </div>
                        </div>
                    </div>

                    {/* Blogs List */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Published Blogs</h2>
                        {profile.posts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-gray-500 text-lg">No blogs published yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {profile.posts.map((post) => (
                                    <Link key={post.id} to={`/blog/${post.id}`} className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                                        <div className="text-gray-600 mb-4 line-clamp-2 prose" dangerouslySetInnerHTML={{ __html: post.content.substring(0, 200) + "..." }} />
                                        <div className="flex items-center justify-between text-sm text-gray-500 mt-4 border-t border-gray-50 pt-4">
                                            <span>{timeAgo(post.createdAt)}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                                                    {post._count.likes}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                                    {post._count.comments}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
        </div>
    );
};
