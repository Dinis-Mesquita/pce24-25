import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import UserInfoForm from "./pages/userinfo";
import CycleEntryForm from "./pages/entryforms";

function App() {
    return (
        <Router>
            <nav style={{ padding: 20 }}>
                <Link to="/user-info" style={{ marginRight: 10 }}>📝 Info Inicial</Link>
                <Link to="/cycle-entry">📅 Novo Ciclo</Link>
            </nav>

            <Routes>
                <Route path="/user-info" element={<UserInfoForm />} />
                <Route path="/cycle-entry" element={<CycleEntryForm />} />
            </Routes>
        </Router>
    );
}

export default App;
