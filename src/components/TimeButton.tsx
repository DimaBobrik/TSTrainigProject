// src/components/TimerButton.tsx
import React, { useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { TimerSession } from "../utils/interfaces/TimeSession";
import { Category } from "../utils/interfaces/Category";

const TimerButton: React.FC = () => {
    const [categories, setCategories] = useLocalStorage("categories", []);
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [timerData, setTimerData] = useState({
        time: 0,
        isActive: false,
        status: "Start",
    });
    const [note, setNote] = useState<string>("");
    const [showNoteInput, setShowNoteInput] = useState<boolean>(false);

    const handleCreateCategory = () => {
        if (newCategoryName.trim() !== "") {
            const newCategory: Category = {
                id: Date.now(),
                name: newCategoryName.trim(),
                sessions: [],
            };
            setCategories([...categories, newCategory]);
            setCurrentCategory(newCategory);
            setNewCategoryName(""); // Очищаем поле ввода после создания категории
        }
    };

    useEffect(() => {
        let timer: number;

        if (timerData.isActive) {
            timer = window.setInterval(() => {
                setTimerData((prevData) => ({
                    ...prevData,
                    time: prevData.time + 1,
                    status: "Running",
                }));
            }, 1000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [timerData.isActive]);

    const handleStartStop = () => {
        if (timerData.isActive) {
            setTimerData((prevData) => ({
                ...prevData,
                isActive: false,
                status: "Complete",
            }));
            setShowNoteInput(true); // Показываем поле заметки после нажатия "Stop"
        } else {
            setTimerData({
                time: 0,
                isActive: true,
                status: "Running",
            });
            setNote("");
            setShowNoteInput(false); // Скрываем поле заметки при новом старте
        }
    };

    const addSessionToCurrentCategory = () => {
        if (currentCategory && note.trim() !== "") {
            const newSession: TimerSession = {
                id: Date.now(),
                time: timerData.time,
                note: note,
                status: timerData.status,
            };

            const updatedCategory: Category = {
                ...currentCategory,
                sessions: [...currentCategory.sessions, newSession],
            };

            const updatedCategories = categories.map((category) =>
                category.id === currentCategory.id ? updatedCategory : category
            );

            setCategories(updatedCategories);
            setCurrentCategory(updatedCategory);
            setShowNoteInput(false); // Скрываем поле заметки после добавления сессии
        }
    };

    const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNote(e.target.value);
    };

    return (
        <div>
            {!currentCategory ? (
                <div>
                    <h2>Create Category</h2>
                    <input
                        type="text"
                        placeholder="Category name..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <button onClick={handleCreateCategory}>Create Category</button>
                </div>
            ) : (
                <div>
                    <h2>Category: {currentCategory.name}</h2>
                    <button onClick={handleStartStop}>
                        {timerData.isActive ? "Stop" : "Start"}
                    </button>
                    <p>Time: {timerData.time} seconds</p>
                    <p>Status: {timerData.status}</p>

                    {showNoteInput && (
                        <div>
                            <label htmlFor="noteInput">Add a note:</label>
                            <input
                                id="noteInput"
                                type="text"
                                value={note}
                                onChange={handleNoteChange}
                            />
                            <button onClick={addSessionToCurrentCategory}>Add Session</button>
                        </div>
                    )}

                    <h3>Sessions</h3>
                    <ul>
                        {currentCategory.sessions.map((session) => (
                            <li key={session.id}>
                                Time: {session.time} seconds, Note: {session.note}, Status: {session.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TimerButton;
