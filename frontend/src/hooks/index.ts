import { useEffect, useState, useCallback } from "react"
import axios from "axios";
import { BACKEND_URL } from "../config";

export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    user: { name: string };
    userId?: number;
}

export interface Blog{
    content:string;
    title:string;
    id:number;
    author:{
        name:string
    };
    _count?: {
        likes: number;
        comments: number;
    };
    likes?: { userId: number }[];
    comments?: Comment[];
}

export interface UserProfile {
    id: number;
    name: string | null;
    email: string;
    bio: string | null;
    avatar: string | null;
    _count: { posts: number };
    totalLikesReceived: number;
    posts: {
        id: number;
        title: string;
        content: string;
        createdAt: string;
        _count: { likes: number, comments: number };
    }[];
}

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();

    useEffect(() => {
        const rawToken = localStorage.getItem("token");
        console.log("Hook: Fetching /blog/" + id + " with token:", rawToken);

        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers: {
                Authorization: `Bearer ${rawToken}`
            }
        })
            .then(response => {
                setBlog(response.data.blog);
                setLoading(false);
            })
            .catch(e => {
                if (e.response?.status === 403) {
                    window.location.href = "/signin";
                }
                setLoading(false);
            });
    }, [id]);

    return {
        loading,
        blog
    }
}

export const useBlogs=()=>{
    const [loading, setLoading]=useState(true);
    const [blogs, setBlogs]=useState<Blog[]>([]);

    useEffect(()=>{
        const rawToken = localStorage.getItem("token");
        console.log("Hook: Fetching /blog/bulk with token:", rawToken);

        axios.get(`${BACKEND_URL}/api/v1/blog/bulk`,{
            headers:{
                Authorization: `Bearer ${rawToken}`
            }
        })
        .then(response=>{
            setBlogs(response.data.blogs);
            setLoading(false)
        })
        .catch(e => {
            if (e.response?.status === 403) {
                window.location.href = "/signin";
            }
            setLoading(false);
        });
    },[])
    return {
        loading,
        blogs
    }
}

export const useLike = () => {
    const toggleLike = async (postId: number) => {
        const rawToken = localStorage.getItem("token");
        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/blog/${postId}/like`, {}, {
                headers: { Authorization: `Bearer ${rawToken}` }
            });
            return res.data;
        } catch (e) {
            console.error("Error toggling like", e);
            throw e;
        }
    };
    return { toggleLike };
}

export const useComments = () => {
    const addComment = async (postId: number, content: string) => {
        const rawToken = localStorage.getItem("token");
        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/blog/${postId}/comment`, { content }, {
                headers: { Authorization: `Bearer ${rawToken}` }
            });
            return res.data.comment;
        } catch (e) {
            console.error("Error adding comment", e);
            throw e;
        }
    };

    const deleteComment = async (postId: number, commentId: number) => {
        const rawToken = localStorage.getItem("token");
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/blog/${postId}/comment/${commentId}`, {
                headers: { Authorization: `Bearer ${rawToken}` }
            });
        } catch (e) {
            console.error("Error deleting comment", e);
            throw e;
        }
    };

    return { addComment, deleteComment };
}

export const useProfile = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/v1/user/${id}`);
            setProfile(res.data.user);
        } catch (e) {
            console.error("Error fetching profile", e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfile = async (data: { name: string, bio: string }) => {
        const rawToken = localStorage.getItem("token");
        try {
            const res = await axios.put(`${BACKEND_URL}/api/v1/user/profile`, data, {
                headers: { Authorization: `Bearer ${rawToken}` }
            });
            await fetchProfile();
            return res.data;
        } catch (e) {
            console.error("Error updating profile", e);
            throw e;
        }
    };

    return { loading, profile, updateProfile };
}