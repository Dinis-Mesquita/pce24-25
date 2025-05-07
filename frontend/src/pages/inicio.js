import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        // Aqui você poderia enviar esses dados para criar um novo usuário
        // Mas por agora, só vamos redirecionar
        console.log("Registar:", { email, password });

        // Armazenar os dados se necessário (simulação)
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPassword", password);

        // Ir para o formulário de perguntas iniciais
        navigate("/user-info");
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#ffe6f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    padding: "40px",
                    borderRadius: "14px",
                    boxShadow: "0 0 15px rgba(0,0,0,0.1)",
                    width: "100%",
                    maxWidth: "400px",
                    textAlign: "center",
                }}
            >
                <h2 style={{ marginBottom: "20px", color: "#d6336c", fontSize: "24px" }}>
                    🌸 <span style={{ fontWeight: "600" }}>Bem-vinda ao Ciclo Tracker!</span>
                </h2>

                <form onSubmit={handleRegister}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginBottom: "20px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#ff80ab",
                            border: "none",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}

                    >
                        Login
                    </button>
                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#ff80ab",
                            border: "none",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            marginTop: "10px",
                        }}

                    >
                        Registar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
