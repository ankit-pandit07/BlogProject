import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate, useParams } from "react-router-dom";
import { ChangeEvent, useState, useEffect } from "react";
import { Appbar } from "../components/Appbar";
import { useBlog } from "../hooks";
import { RichTextEditor } from "../components/RichTextEditor";

export const EditBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loading, blog } = useBlog({ id: id || "" });

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/signin");
        }
        if (blog) {
            setTitle(blog.title);
            setContent(blog.content);
        }
    }, [navigate, blog]);

    if (loading) {
        return <div>
            <Appbar />
            <div className="flex justify-center mt-12">
                <div className="animate-pulse font-semibold">Loading editor...</div>
            </div>
        </div>
    }

    return <div>
        <Appbar />
        <div className="flex justify-center w-full pt-8"> 
            <div className="max-w-screen-lg w-full px-10">
                <div className="text-3xl font-bold mb-4">Edit Blog</div>
                <input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} 
                    type="text" 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                    placeholder="Title" 
                />
                <RichTextEditor content={content} setContent={setContent} />
                <button 
                    onClick={async () => {
                        try {
                            await axios.put(`${BACKEND_URL}/api/v1/blog`, {
                                id: Number(id),
                                title,
                                content
                            }, {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`
                                }
                            });
                            navigate(`/blog/${id}`);
                        } catch (e: any) {
                            if (e.response?.status === 403) {
                                alert(e.response.data.message || "Unauthorized");
                            } else {
                                alert("Failed to update post.");
                            }
                        }
                    }} 
                    type="submit" 
                    className="mt-4 inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800"
                >
                    Update post
                </button>
            </div>
        </div>
    </div>
}

