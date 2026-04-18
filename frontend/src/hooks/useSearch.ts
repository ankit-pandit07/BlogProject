import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

interface SearchResult {
    posts: { id: number, title: string, content: string, author: { name: string } }[];
    users: { id: number, name: string }[];
}

export const useSearch = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult>({ posts: [], users: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults({ posts: [], users: [] });
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${BACKEND_URL}/api/v1/search?q=${query}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                setResults(res.data);
            } catch (e) {
                console.error("Search failed", e);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return { query, setQuery, results, loading };
};
