import React, { useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { TimerSession } from "../utils/interfaces/TimeSession";
import { Category } from "../utils/interfaces/Category";

const TimerButton: React.FC = () => {
    const [categories, setCategories] = useLocalStorage<Category[]>("categories", []);
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [timerData, setTimerData] = useState({
        time: 0,
        isActive: false,
        isPaused: false,
        status: "Start",
    });
    const [note, setNote] = useState("");
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [isSelectingExisting, setIsSelectingExisting] = useState(false);
    const [showTimer, setShowTimer] = useState<boolean>(false);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [canStartNewSession, setCanStartNewSession] = useState<boolean>(false);

    const handleCreateCategory = () => {
        if (newCategoryName.trim() !== "") {
            const newCategory: Category = {
                id: Date.now(),
                name: newCategoryName.trim(),
                sessions: [],
            };
            setCategories([...categories, newCategory]);
            setCurrentCategory(newCategory);
            setNewCategoryName("");
            handleCreateNewSession(newCategory);
        }
    };

    const handleCreateNewSession = (category: Category) => {
        const newSession: TimerSession = {
            id: Date.now(),
            time: 0,
            note: "",
            status: "Running",
        };
        category.sessions.push(newSession);
        setSelectedSessionId(newSession.id);
        setTimerData({
            time: 0,
            isActive: true,
            isPaused: false,
            status: "Stop",
        });
        setShowTimer(true);
        setShowNoteInput(false); // Hide note input initially
        setCanStartNewSession(false); // Reset flag for new session creation
    };

    const handleSelectCategory = (id: number) => {
        const selectedCategory = categories.find((category) => category.id === id) || null;
        setCurrentCategory(selectedCategory);
        setShowTimer(false);
    };

    const handleStartSession = (sessionId: number) => {
        setSelectedSessionId(sessionId);
        const selectedSession = currentCategory?.sessions.find((session) => session.id === sessionId);
        if (selectedSession) {
            setTimerData({
                time: selectedSession.time,
                isActive: true,
                isPaused: false,
                status: "Stop",
            });
            setShowTimer(true); // Show the timer when a session is selected
        }
    };

    useEffect(() => {
        let timer: number;

        if (timerData.isActive && !timerData.isPaused) {
            timer = window.setInterval(() => {
                setTimerData((prevData) => ({
                    ...prevData,
                    time: prevData.time + 1,
                }));
            }, 1000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [timerData.isActive, timerData.isPaused]);

    const handleStop = () => {
        if (timerData.isActive && currentCategory && selectedSessionId !== null) {
            setTimerData((prevData) => ({
                ...prevData,
                isActive: false,
                isPaused: false,
                status: "Start",
            }));

            const updatedSessions = currentCategory.sessions.map((session) =>
                session.id === selectedSessionId ? { ...session, time: timerData.time, status: "Stopped" } : session
            );

            const updatedCategory: Category = {
                ...currentCategory,
                sessions: updatedSessions,
            };

            const updatedCategories = categories.map((category) =>
                category.id === currentCategory.id ? updatedCategory : category
            );

            setCategories(updatedCategories);
            setCurrentCategory(updatedCategory);
            setShowTimer(false); // Hide the timer after stopping
            setShowNoteInput(true); // Show note input
            setCanStartNewSession(true); // Allow new session creation
        }
    };

    const handlePause = () => {
        setTimerData((prevData) => ({
            ...prevData,
            isPaused: !prevData.isPaused,
            status: prevData.isPaused ? "Stop" : "Paused",
        }));
    };

    const handleAddNote = () => {
        if (note.trim() !== "" && currentCategory && selectedSessionId !== null) {
            const updatedSessions = currentCategory.sessions.map((session) =>
                session.id === selectedSessionId ? { ...session, note: note.trim() } : session
            );

            const updatedCategory: Category = {
                ...currentCategory,
                sessions: updatedSessions,
            };

            const updatedCategories = categories.map((category) =>
                category.id === currentCategory.id ? updatedCategory : category
            );

            setCategories(updatedCategories);
            setCurrentCategory(updatedCategory);
            setShowNoteInput(false);
            setNote(""); // Clear the note input
            setCanStartNewSession(true); // Allow new session creation
        }
    };

    const handleStartNewSession = () => {
        if (currentCategory) {
            handleCreateNewSession(currentCategory);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto p-4 flex flex-col items-center justify-center">
                {!currentCategory ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">Select or Create Category</h2>
                        <div className="flex justify-center items-center space-x-6 mb-6">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="categoryOption"
                                    checked={!isSelectingExisting}
                                    onChange={() => setIsSelectingExisting(false)}
                                    className="mr-2"
                                />
                                <span>Create New Category</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="categoryOption"
                                    checked={isSelectingExisting}
                                    onChange={() => setIsSelectingExisting(true)}
                                    className="mr-2"
                                />
                                <span>Select Existing Category</span>
                            </label>
                        </div>

                        {isSelectingExisting ? (
                            <div className="flex flex-col items-center">
                                <select
                                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                                    value={selectedCategoryId ?? ""}
                                    className="mb-4 p-2 border border-gray-300 rounded-lg bg-gray-800 text-white"
                                >
                                    <option value="" disabled>
                                        Select a Category
                                    </option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => {
                                        if (selectedCategoryId !== null) {
                                            handleSelectCategory(selectedCategoryId);
                                        }
                                    }}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                >
                                    Go to Sessions
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <input
                                    type="text"
                                    placeholder="Category name..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="mb-4 p-2 border border-gray-300 rounded-lg bg-gray-800 text-white"
                                />
                                <button
                                    onClick={handleCreateCategory}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                                >
                                    Create Category
                                </button>
                            </div>
                        )}
                    </div>
                ) : showTimer ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Category: {currentCategory.name}</h2>
                        <button
                            onClick={handleStop}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition mb-2"
                        >
                            {timerData.status === "Stop" ? "Stop" : "Start"}
                        </button>
                        <button
                            onClick={handlePause}
                            disabled={!timerData.isActive}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition mb-4"
                        >
                            {timerData.isPaused ? "Resume" : "Pause"}
                        </button>
                        <p className="text-lg">Time: {timerData.time} seconds</p>
                        <p className="text-lg">Status: {timerData.status}</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Category: {currentCategory.name}</h2>
                        <h3 className="text-xl font-semibold mb-4">Sessions</h3>
                        <ul className="space-y-2 text-black w-full max-w-xl">
                            {currentCategory.sessions.map((session) => (
                                <li
                                    key={session.id}
                                    onClick={() => handleStartSession(session.id)}
                                    className={`cursor-pointer p-2 rounded-lg ${
                                        session.id === selectedSessionId ? "bg-blue-200" : "bg-gray-100"
                                    }`}
                                >
                                    Time: {session.time} seconds, Note: {session.note}, Status: {session.status}
                                </li>
                            ))}
                        </ul>
                        {showNoteInput && (
                            <div className="mt-4 w-full max-w-xl">
                            <textarea
                                placeholder="Add a note..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg mb-2 bg-gray-800 text-white"
                            />
                                <button
                                    onClick={handleAddNote}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                                >
                                    Save Note
                                </button>
                            </div>
                        )}
                        {canStartNewSession && (
                            <button
                                onClick={handleStartNewSession}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mt-4"
                            >
                                {timerData.status === "Start" ? "Start" : "Stop"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );


};

export default TimerButton;
