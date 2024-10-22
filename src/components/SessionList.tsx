// src/components/SessionList.tsx
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
        <div>
            <h2>Saved Timer Sessions</h2>
            <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={handleSearchChange}
            />

            <ul>
                {filteredSessions.map((session) => (
                    <li key={session.id}>
                        Time: {session.time} seconds, Note: {session.note}, Status: {session.status}
                        <div>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleAddToCategory(category.id, session)}
                                >
                                    Add to {category.name}
                                </button>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>

            <h3>Create New Category</h3>
            <input
                type="text"
                placeholder="Category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button onClick={handleCreateCategory}>Create Category</button>

            <h3>Categories</h3>
            <ul>
                {categories.map((category) => (
                    <li key={category.id}>
                        <h4>{category.name}</h4>
                        <ul>
                            {category.sessions.map((session) => (
                                <li key={session.id}>
                                    Time: {session.time} seconds, Note: {session.note}, Status: {session.status}
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
