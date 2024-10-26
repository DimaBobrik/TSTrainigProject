import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../reducerConfig/storeConfig.ts';
import { addCategory, removeCategory, addSessionToCategory, deleteSession } from '../reducers/categoryReducer';
import { TimerSession } from "../utils/interfaces/TimeSession";
import { Category } from "../utils/interfaces/Category";

const SessionList: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const categories = useSelector((state: RootState) => state.categories.categories);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [newSessionTime, setNewSessionTime] = useState<number>(0);
    const [newSessionNote, setNewSessionNote] = useState<string>("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [sets, setSets] = useState<{ repetitions: number }[]>([]);

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
            dispatch(addCategory(newCategory));
            setNewCategoryName("");
        }
    };

    const handleRemoveCategory = (categoryId: number) => {
        dispatch(removeCategory(categoryId));
    };

    const handleAddNewSet = () => {
        // Проверка, чтобы можно было добавить только один сет
        if (sets.length === 0) {
            setSets([{ repetitions: 0 }]);
        }
    };

    const handleSetChange = (index: number, value: number) => {
        const updatedSets = sets.map((set, i) =>
            i === index ? { ...set, repetitions: value } : set
        );
        setSets(updatedSets);
    };

    const handleAddNewSession = () => {
        if (selectedCategoryId !== null) {
            const newSession: TimerSession = {
                id: Date.now(),
                time: newSessionTime,
                note: newSessionNote,
                status: "Running",
                sets: sets.length > 0 ? sets : [],
            };
            dispatch(addSessionToCategory({ categoryId: selectedCategoryId, session: newSession }));
            setNewSessionTime(0);
            setNewSessionNote("");
            setSets([]);
        }
    };

    const handleDeleteSession = (sessionId: number) => {
        dispatch(deleteSession(sessionId));
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
                        <div className="flex flex-col justify-between items-start text-gray-700">
                            <div>
                                <p className="text-gray-700">Time: <span className="font-semibold">{session.time} seconds</span></p>
                                <p className="text-gray-700">Note: <span className="font-semibold">{session.note}</span></p>
                                <p className="text-gray-700">Status: <span className="font-semibold">{session.status}</span></p>
                                <h4 className="font-bold mt-2">Sets:</h4>
                                {session.sets && session.sets.length > 0 ? (
                                    <ul className="pl-4 list-disc">
                                        {session.sets.map((set, index) => (
                                            <li key={index}>
                                                {set.repetitions} repetitions
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No sets available</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleDeleteSession(session.id)}
                                className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition mt-2"
                            >
                                Delete Session
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <h3 className="text-xl font-bold mt-8 mb-4">Add New Session</h3>
            <div className="flex flex-col mb-4">
                <input
                    type="number"
                    placeholder="Time in seconds"
                    value={newSessionTime}
                    onChange={(e) => setNewSessionTime(Number(e.target.value))}
                    className="mb-2 p-2 border border-gray-300 rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Session note"
                    value={newSessionNote}
                    onChange={(e) => setNewSessionNote(e.target.value)}
                    className="mb-2 p-2 border border-gray-300 rounded-lg"
                />
                <h4 className="text-lg font-bold mb-2">Add Set</h4>
                {sets.length === 0 && (
                    <button
                        onClick={handleAddNewSet}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition mb-4"
                    >
                        Add Set
                    </button>
                )}
                {sets.map((set, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                        <input
                            type="number"
                            placeholder="Repetitions"
                            value={set.repetitions}
                            onChange={(e) => handleSetChange(index, Number(e.target.value))}
                            className="p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                ))}
                <select
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    value={selectedCategoryId ?? ""}
                    className="mb-2 p-2 border border-gray-300 rounded-lg"
                >
                    <option value="" disabled>Select a Category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                <button
                    onClick={handleAddNewSession}
                    className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
                >
                    Add Session to Category
                </button>
            </div>

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
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
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
                                    <h5 className="font-bold mt-2">Sets:</h5>
                                    {session.sets && session.sets.length > 0 ? (
                                        <ul className="pl-4 list-disc">
                                            {session.sets.map((set, index) => (
                                                <li key={index}>
                                                    {set.repetitions} repetitions
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">No sets available</p>
                                    )}
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

