import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../reducerConfig/storeConfig.ts';
import { setCategories, updateCategory } from '../reducers/categoryReducer';
import { TimerSession } from "../utils/interfaces/TimeSession";
import { Category } from "../utils/interfaces/Category";

const TimerButton: React.FC = () => {
    const dispatch = useDispatch();
    const categories = useSelector((state: RootState) => state.categories.categories);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [activeSession, setActiveSession] = useState<TimerSession | null>(null);
    const [currentRepetition, setCurrentRepetition] = useState(1);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [completedRestCount, setCompletedRestCount] = useState<number>(0);
    const [completedSessionIds, setCompletedSessionIds] = useState<number[]>(() =>
        JSON.parse(localStorage.getItem("completedSessionIds") || "[]")
    );
    const restPeriod = 5;
    const finalRestPeriod = 180;

    // Загружаем категории из Local Storage и устанавливаем в Redux
    useEffect(() => {
        const storedCategories = JSON.parse(localStorage.getItem("categories") || "[]") as Category[];
        dispatch(setCategories(storedCategories));
    }, [dispatch]);

    const handleSelectCategory = (id: number | null) => {
        const selectedCategory = categories.find((category) => category.id === id) || null;
        if (selectedCategory) {
            setCurrentCategory(selectedCategory);
            setActiveSession(null);
            setCurrentRepetition(1);
            setCompletedRestCount(0);
        }
    };

    const handleStartSession = (session: TimerSession) => {
        setActiveSession(session);
        setCurrentRepetition(1);
        setTimeRemaining(null);
        setCompletedRestCount(0);
    };

    const handleStop = () => {
        if (!activeSession || !currentCategory) return;

        const totalRepetitions = activeSession.sets.reduce((sum, set) => sum + set.repetitions, 0);

        if (currentRepetition === totalRepetitions) {
            setCompletedSessionIds((prev) => {
                const updatedIds = [...prev, activeSession.id];
                localStorage.setItem("completedSessionIds", JSON.stringify(updatedIds));
                return updatedIds;
            });
            setActiveSession(null);
            setTimeRemaining(finalRestPeriod);
        } else {
            if (timeRemaining === null) {
                setTimeRemaining(restPeriod);
            } else if (timeRemaining === 0) {
                setCurrentRepetition((prev) => prev + 1);
                setCompletedRestCount((prev) => prev + 1);
                setTimeRemaining(null);
            }
        }
    };

    const handleBack = () => {
        if (activeSession) {
            // Возврат к списку сессий в выбранной категории
            setActiveSession(null);
        } else if (currentCategory) {
            // Возврат к выбору категории
            setCurrentCategory(null);
            setSelectedCategoryId(null);
        }
    };

    useEffect(() => {
        let timer: number | undefined;
        if (timeRemaining !== null && timeRemaining > 0) {
            timer = window.setInterval(() => {
                setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
            }, 1000);
        } else if (timeRemaining === 0) {
            handleStop();
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [timeRemaining, activeSession]);

    useEffect(() => {
        if (!currentCategory) return;

        const updatedCategories = categories.map((cat) =>
            cat.id === currentCategory.id ? currentCategory : cat
        );
        localStorage.setItem("categories", JSON.stringify(updatedCategories));
        dispatch(updateCategory(currentCategory));
    }, [completedRestCount, currentCategory, categories, dispatch]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto p-4 flex flex-col items-center justify-center">
                {/* Кнопка Back будет доступна, если выбрана категория или активна сессия */}
                {(currentCategory || activeSession) && (
                    <button
                        onClick={handleBack}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition mb-4"
                    >
                        Back
                    </button>
                )}

                {!currentCategory ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">Select a Category</h2>
                        <div className="flex flex-col items-center">
                            <select
                                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                                value={selectedCategoryId ?? ""}
                                className="mb-4 p-2 border border-gray-300 rounded-lg bg-gray-800 text-white"
                            >
                                <option value="" disabled>Select a Category</option>
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
                    </div>
                ) : activeSession ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Exercise: {activeSession.note}</h2>
                        <p className="text-lg">Repetition: {currentRepetition}</p>
                        <p className="text-lg">Completed Rests: {completedRestCount}</p>
                        {timeRemaining !== null ? (
                            <p className="text-lg text-red-600">Rest Time: {timeRemaining} seconds</p>
                        ) : (
                            <button
                                onClick={handleStop}
                                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition mb-2"
                            >
                                Stop
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Category: {currentCategory.name}</h2>
                        <h3 className="text-xl font-semibold mb-4">Sessions</h3>
                        <ul className="space-y-2 text-black w-full max-w-xl">
                            {currentCategory.sessions.map((session) => (
                                <li
                                    key={session.id}
                                    onClick={() => handleStartSession(session)}
                                    className={`cursor-pointer p-2 rounded-lg ${
                                        completedSessionIds.includes(session.id)
                                            ? "bg-green-300"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    Time: {session.time} seconds, Note: {session.note}, Repetitions:{" "}
                                    {session.sets.reduce((sum, set) => sum + set.repetitions, 0)}
                                </li>
                            ))}
                        </ul>
                        {timeRemaining !== null && !activeSession && (
                            <p className="text-lg text-yellow-500 mt-4">Rest Time Between Sessions: {timeRemaining} seconds</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimerButton;
