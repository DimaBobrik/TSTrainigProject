import React, { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { TimerSession } from "../utils/interfaces/TimeSession";
import { Category } from "../utils/interfaces/Category";

const SessionList: React.FC = () => {
    const [categories, setCategories] = useLocalStorage<Category[]>("categories", []);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [newCategoryName, setNewCategoryName] = useState<string>("");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleCreateCategory = () => {
        if (newCategoryName.trim() !== "") {
            const newCategory: Category = {
                id: Date.now(),
                name: newCategoryName.trim(),
                sessions: [],
            };
            setCategories([...categories, newCategory]);
            setNewCategoryName("");
        }
    };

    const handleRemoveCategory = (categoryId: number) => {
        setCategories(categories.filter((category) => category.id !== categoryId));
    };

    const handleAddToCategory = (categoryId: number, session: TimerSession) => {
        setCategories(categories.map((category) => {
            if (category.id === categoryId) {
                const isAlreadyAdded = category.sessions.some((s) => s.id === session.id);
                if (!isAlreadyAdded) {
                    return {
                        ...category,
                        sessions: [...category.sessions, session],
                    };
                }
            }
            return category;
        }));
    };

    const allSessions = categories
        .flatMap((category) => category.sessions)
        .filter((session, index, self) =>
            index === self.findIndex((s) => s.note === session.note)
        );

    const filteredSessions = allSessions.filter((session) =>
        session.note.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Saved Timer Sessions</h2>
            <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
            />

            <ul className="space-y-4">
                {filteredSessions.map((session) => (
                    <li key={session.id} className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex flex-col justify-between items-start">
                            <div>
                                <p className="text-gray-700">Time: <span className="font-semibold">{session.time} seconds</span></p>
                                <p className="text-gray-700">Note: <span className="font-semibold">{session.note}</span></p>
                                <p className="text-gray-700">Status: <span className="font-semibold">{session.status}</span></p>
                            </div>
                            <div className="flex flex-wrap space-x-2 space-y-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleAddToCategory(category.id, session)}
                                        className="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition"
                                    >
                                        Add to {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <h3 className="text-xl font-bold mt-8 mb-4">Create New Category</h3>
            <div className="flex items-center space-x-4">
                <input
                    type="text"
                    placeholder="Category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-lg"
                />
                <button
                    onClick={handleCreateCategory}
                    className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
                >
                    Create Category
                </button>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">Categories</h3>
            <ul className="space-y-4">
                {categories.map((category) => (
                    <li key={category.id} className="bg-gray-100 p-4 rounded-lg shadow-md text-black">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold mb-2">{category.name}</h4>
                            <button
                                onClick={() => handleRemoveCategory(category.id)}
                                className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition"
                            >
                                Remove
                            </button>
                        </div>
                        <ul className="pl-4 list-disc">
                            {category.sessions.map((session) => (
                                <li key={session.id} className="text-gray-700">
                                    Time: <span className="font-semibold">{session.time} seconds</span>, Note: <span className="font-semibold">{session.note}</span>, Status: <span className="font-semibold">{session.status}</span>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SessionList;
