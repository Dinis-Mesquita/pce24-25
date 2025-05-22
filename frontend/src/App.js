import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CycleEntryForm from "./pages/entryforms";
import UserInfoForm from "./pages/userinfo";
import LoginPage from "./pages/inicio";
import DiaryHistory from "./pages/historico";
import MiniHistory from "./components/minihistorico";
import { getUserIdFromToken } from "./components/autenticacao";

const HomePage = () => {
    const id_user = getUserIdFromToken();

    return (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffe6f0", minHeight: "100vh" }}>
            <h1 style={{ fontSize: "2em", color: "#d6336c" }}>🌸 Bem-vinda ao Ciclo Tracker!</h1>
            <p style={{ marginTop: 10 }}>Acompanhe seu ciclo menstrual de forma simples!</p>
            <div style={{ marginTop: 30 }}>
                <Link to="/user/new-cycle" style={linkStyle}>➕ Novo Ciclo</Link>
                <Link to="/user/history" style={linkStyle}>📖 Ver Histórico Completo</Link>
            </div>

            {/* 🆕 Show recent entries */}
            <MiniHistory id_user={id_user} />
        </div>
    );
};

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
            <Route path="/user" element={<HomePage />} />
            <Route path="/user/new-cycle" element={<CycleEntryForm />} />
            <Route path="/user/user-info" element={<UserInfoForm />} />
            <Route path="/user/history" element={<DiaryHistory />} />
            <Route path="/" element={<LoginPage />} />
        </Routes>
    </Router>
);

export default App;
