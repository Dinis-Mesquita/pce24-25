import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import CycleEntryForm from "./pages/entryforms";
import UserInfoForm from "./pages/userinfo";
import LoginPage from "./pages/inicio";
import DiaryHistory from "./pages/historico";
import MiniHistory from "./components/minihistorico";
import PeriodCalendar from "./components/calendario";
import { getUserIdFromToken, removeToken, hasToken } from "./components/autenticacao";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";


const HomePage = () => {
    const id_user = getUserIdFromToken();
    const navigate = useNavigate();

    const handleLogout = () => {
        removeToken();
        navigate("/");
    };

    if (!id_user) {
        return (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffe6f0", minHeight: "100vh" }}>
                <h1 style={{ fontSize: "2em", color: "#d6336c" }}>🌸 Bem-vinda ao Ciclo Tracker!</h1>
                <p style={{ marginTop: 20, marginBottom: 30 }}>Por favor, faça login para acessar seu ciclo menstrual</p>
                <Link to="/" style={linkStyle}>🔑 Fazer Login</Link>
            </div>
        );
    }

    return (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffe6f0", minHeight: "100vh" }}>
            <h1 style={{ fontSize: "2em", color: "#d6336c" }}>🌸 Bem-vinda ao Ciclo Tracker!</h1>
            <p style={{ marginTop: 10 }}>Acompanhe seu ciclo menstrual de forma simples!</p>
            <div style={{ marginTop: 30 }}>
                <Link to="/user/new-cycle" style={linkStyle}>➕ Novo Ciclo</Link>
                <Link to="/user/history" style={linkStyle}>📖 Ver Histórico Completo</Link>
                <button
                    onClick={handleLogout}
                    style={{
                        ...linkStyle,
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        background: '#d6336c'
                    }}
                >
                    Logout
                </button>
            </div>

            <h2 style={{ marginTop: 50, color: "#d6336c" }}></h2>
            <PeriodCalendar id_user={id_user} />

            <MiniHistory id_user={id_user} />


        </div>
    );
};

const ProtectedRoute = ({ children }) => {
    if (!hasToken()) {
        return <Navigate to="/" replace />;
    }
    return children;
};

const LoginRoute = ({ children }) => {
    if (hasToken()) {
        removeToken(); // Remove token if accessing login page while logged in
    }
    return children;
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
            <Route path="/user" element={
                <ProtectedRoute>
                    <HomePage />
                </ProtectedRoute>
            } />
            <Route path="/user/new-cycle" element={
                <ProtectedRoute>
                    <CycleEntryForm />
                </ProtectedRoute>
            } />
            <Route path="/user/user-info" element={
                <ProtectedRoute>
                    <UserInfoForm />
                </ProtectedRoute>
            } />
            <Route path="/user/history" element={
                <ProtectedRoute>
                    <DiaryHistory />
                </ProtectedRoute>
            } />
            <Route path="/" element={
                <LoginRoute>
                    <LoginPage />
                </LoginRoute>
            } />
        </Routes>
    </Router>
);

export default App;
