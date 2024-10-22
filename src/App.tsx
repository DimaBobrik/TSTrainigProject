// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TimerButton from "./components/TimeButton.tsx";
import SessionList from "./components/SessionList.tsx";

const App: React.FC = () => {
    return (
        <Router>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/sessions">Sessions List</Link>
                    </li>
                </ul>
            </nav>

            <Routes>
                <Route path="/" element={<TimerButton />} />
                <Route path="/sessions" element={<SessionList />} />
            </Routes>
        </Router>
    );
};

export default App;
