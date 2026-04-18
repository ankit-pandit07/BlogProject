import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useState, useEffect } from "react";
import { Appbar } from "../components/Appbar";
import { RichTextEditor } from "../components/RichTextEditor";

export const Publish = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/signin");
        }
    }, [navigate]);

    return <div>
        <Appbar />
        <div className="flex justify-center w-full pt-8"> 
            <div className="max-w-screen-lg w-full">
                <input 
                    onChange={(e) => setTitle(e.target.value)} 
                    type="text" 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                    placeholder="Title" 
                />
                <RichTextEditor content={content} setContent={setContent} />
                <button 
                    onClick={async () => {
                        try {
                            const response = await axios.post(`${BACKEND_URL}/api/v1/blog`, {
                                title,
                                content
                            }, {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`
                                }
                            });
                            navigate(`/blog/${response.data.id}`);
                        } catch (e: any) {
                            if (e.response?.status === 403) {
                                navigate("/signin");
                            } else {
                                alert("Failed to publish post.");
                            }
                        }
                    }} 
                    type="submit" 
                    className="mt-4 inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                >
                    Publish post
                </button>
            </div>
        </div>
    </div>
}

