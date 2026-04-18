import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "./BlogCard";
import { SearchBar } from "./SearchBar";

export const Appbar=()=>{
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/signin");
    }

    return <div className="border-b flex justify-between px-10 py-4 items-center bg-white sticky top-0 z-50">
        <Link to={'/blogs'} className="flex items-center gap-2 cursor-pointer font-bold text-2xl tracking-tight text-gray-900">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-lg leading-none">M</div>
            <span className="hidden sm:block">Medium</span>
        </Link>
        
        <div className="flex-1 max-w-xl mx-4 flex justify-center">
            <SearchBar />
        </div>

        <div className="flex items-center gap-4">
            <Link to={`/publish`}>
                <button type="button" className="hidden sm:block mr-2 text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center transition-colors">
                    Write
                </button>
            </Link>
            <button onClick={handleLogout} type="button" className="text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-4 py-2 transition-colors">
                Logout
            </button>
            <Avatar size={"big"} name="Ankit" />
        </div>
    </div>
}