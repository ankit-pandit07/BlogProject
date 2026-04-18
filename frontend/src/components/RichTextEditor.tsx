import { useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";

export const RichTextEditor = ({ content, setContent }: { content: string, setContent: (val: string) => void }) => {
    const quillRef = useRef<ReactQuill>(null);

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
                alert("Cloudinary cloud name is required for image upload.");
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
            } catch (err) {
                console.error("Image upload failed", err);
                alert("Failed to upload image. Please check your Cloudinary configuration.");
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
        </div>
    );
};
