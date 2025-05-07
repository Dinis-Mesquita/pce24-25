import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CycleEntryForm from "./pages/entryforms";
import UserInfoForm from "./pages/userinfo";
import LoginPage from "./pages/inicio";

const HomePage = () => (
    <div style={{ textAlign: "center", padding: "60px 20px" ,background: "#ffe6f0"}}>
        <h1 style={{ fontSize: "2em", color: "#d6336c" }}>🌸 Bem-vinda ao Ciclo Tracker!</h1>
        <p style={{ marginTop: 10 }}>Acompanhe seu ciclo mesntrual de forma simples!</p>
        <div style={{ marginTop: 30 }}>
            <Link to="/new-cycle" style={linkStyle}>➕ Novo Ciclo</Link>
        </div>
    </div>
);

const linkStyle = {
    display: "inline-block",
    margin: "10px",
    padding: "12px 24px",
    backgroundColor: "#ff6f91",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
};

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new-cycle" element={<CycleEntryForm />} />
            <Route path="/user-info" element={<UserInfoForm />} />
            <Route path="/login" element={<LoginPage />} />

        </Routes>
    </Router>
);

export default App;
