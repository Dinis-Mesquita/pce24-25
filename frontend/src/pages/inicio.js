import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e, isLogin) => {
        e.preventDefault();

        const endpoint = isLogin ? "/api/login" : "/api/register";

        try {
            const response = await fetch(`http://localhost:3001${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Erro.");
                return;
            }

            // Save token and id_user for both login and register
            if (data.token) localStorage.setItem("token", data.token);
            if (data.id_user) localStorage.setItem("id_user", data.id_user);

            if (isLogin) {
                navigate("/user");
            } else {
                // Redirect to initial form page immediately after register
                navigate("/user/user-info");
            }
        } catch (err) {
            console.error("Erro:", err);
            alert("Erro de conexão.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>🌸 <span style={{ fontWeight: "600" }}>Bem-vinda ao Ciclo Tracker!</span></h2>
                <form>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                    />
                    <button type="submit" onClick={(e) => handleSubmit(e, true)} style={styles.button}>Login</button>
                    <button type="submit" onClick={(e) => handleSubmit(e, false)} style={{ ...styles.button, marginTop: 10 }}>
                        Registrar
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: "100vh",
        background: "#ffe6f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
    },
    card: {
        background: "#fff",
        padding: "40px",
        borderRadius: "14px",
        boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center",
    },
    title: {
        marginBottom: "20px",
        color: "#d6336c",
        fontSize: "24px",
    },
    input: {
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
    },
    button: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#ff80ab",
        border: "none",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "16px",
        borderRadius: "8px",
        cursor: "pointer",
    },
};

export default LoginPage;
