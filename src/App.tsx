import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./index.css";
import TimerButton from "./components/TimeButton";
import SessionList from "./components/SessionList";

const App: React.FC = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                {/* Navigation bar */}
                <nav className="bg-gray-800 p-4 shadow-lg">
                    <ul className="flex space-x-4 justify-center">
                        <li>
                            <Link
                                to="/"
                                className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/sessions"
                                className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Sessions List
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Main container for content */}
                <div className="flex-grow container mx-auto p-4 flex items-center justify-center">
                    <Routes>
                        <Route path="/" element={<TimerButton/>}/>
                        <Route path="/sessions" element={<SessionList/>}/>
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
