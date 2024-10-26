import React, {useState, useEffect} from "react";
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../reducerConfig/storeConfig';
import {
    fetchCategories,
    createCategory,
    deleteCategory,
    addSession,
    removeSessionFromCategory
} from '../reducers/categoryReducer';
import {TimerSession} from "../utils/interfaces/TimeSession";
import {Category} from "../utils/interfaces/Category";

const SessionList: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const categories = useSelector((state: RootState) => state.categories.categories);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [newSessionTime, setNewSessionTime] = useState<number>(0);
    const [newSessionNote, setNewSessionNote] = useState<string>("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [sets, setSets] = useState<{ repetitions: number }[]>([]);

    useEffect(() => {
        // Fetch categories when the component mounts
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleCreateCategory = () => {
        if (newCategoryName.trim() !== "") {
            const newCategory: Category = {
                id: Date.now().toString(),
                name: newCategoryName.trim(),
                sessions: [],
            };
            dispatch(createCategory(newCategory))
                .unwrap()
                .then(() => {
                    setNewCategoryName(""); // Reset the input only after success
                })
                .catch((error) => {
                    console.error("Error creating category:", error);
                });
        }
    };

    const handleRemoveCategory = (categoryId: string) => {
        dispatch(deleteCategory(categoryId));
    };

    const handleAddNewSet = () => {
        setSets((prevSets) => [...prevSets, {repetitions: 0}]);
    };

    const handleSetChange = (index: number, value: number) => {
        const updatedSets = sets.map((set, i) =>
            i === index ? {...set, repetitions: value} : set
        );
        setSets(updatedSets);
    };

    const handleAddNewSession = () => {
        if (selectedCategoryId !== null) {
            const newSession: TimerSession = {
                id: Date.now().toString(),
                time: newSessionTime,
                note: newSessionNote,
                status: "Running",
                sets: sets.length > 0 ? sets : [],
            };
            dispatch(addSession({categoryId: selectedCategoryId, session: newSession}))
                .unwrap()
                .then(() => {
                    setNewSessionTime(0);
                    setNewSessionNote("");
                    setSets([]);
                })
                .catch((error) => {
                    console.error("Error adding new session:", error);
                });
        }
    };

    const handleDeleteSession = (categoryId: string, sessionId: string) => {
        console.log("Deleting session with categoryId:", categoryId, "and sessionId:", sessionId);
        dispatch(removeSessionFromCategory({categoryId, sessionId}));
    };

    const filteredCategories = categories.map((category) => ({
        ...category,
        sessions: category.sessions.filter((session) =>
            session.note.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    }));

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
                <button
                    onClick={handleAddNewSet}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition mb-4"
                >
                    Add Set
                </button>
                <select
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
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

            <h3 className="text-xl font-bold mt-8 mb-4">Sessions by Category</h3>
            {filteredCategories.map((category) => (
                <div key={category.id} className="bg-gray-100 p-4 rounded-lg shadow-md text-black">
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
                            <li key={session.id} className="text-gray-700 flex align-center justify-between">
                                <div className="">
                                Exercise: <span className="font-semibold">{session.note}</span>
                                {session.sets && session.sets.length > 0 ? (
                                    session.sets.map((set, index) => (
                                        <span key={index}>
                                                x{set.repetitions}
                                            </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No sets available</p>
                                )}
                                </div>
                                <button
                                    onClick={() => handleDeleteSession(category.id, session.id)}
                                    className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition mt-2"
                                >
                                    Delete Session
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default SessionList;
