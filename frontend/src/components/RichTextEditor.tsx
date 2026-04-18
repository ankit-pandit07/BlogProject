import { useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { Toast } from "./Toast";

export const RichTextEditor = ({ content, setContent }: { content: string, setContent: (value: string) => void }) => {
    const quillRef = useRef<ReactQuill>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error">("error");

    // Custom Image Handler for Cloudinary
    const imageHandler = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files ? input.files[0] : null;
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "iirmyaoc"); // Provided by user
            
            // IMPORTANT: If cloud name is missing, use a fallback prompt
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || prompt("Please enter your Cloudinary Cloud Name:");
            if (!cloudName) {
                console.error("Cloudinary cloud name missing in env");
                setToastMessage("Cloudinary cloud name is required for image upload.");
                setToastType("error");
                return;
            }

            try {
                // Upload to Cloudinary Unsigned
                const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
                const imageUrl = res.data.secure_url;

                // Insert into Editor
                const quill = quillRef.current?.getEditor();
                if (quill) {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, "image", imageUrl);
                    quill.setSelection({ index: range.index + 1, length: 0 });
                }
            } catch (error) {
                console.error("Error uploading image to Cloudinary", error);
                setToastMessage("Failed to upload image. Please check your Cloudinary configuration.");
                setToastType("error");
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image', 'blockquote'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    return (
        <div className="w-full">
            <ReactQuill 
                ref={quillRef}
                theme="snow" 
                value={content} 
                onChange={setContent} 
                modules={modules}
                placeholder="Tell your story..."
                className="h-96 pb-12 text-lg"
            />
            <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
        </div>
    );
};
