import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "../components/autenticacao";

const DiaryHistory = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const id_user = getUserIdFromToken();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/diario/${id_user}`);
                const data = await res.json();
                setEntries(data);
            } catch (err) {
                console.error("Erro ao buscar histórico:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, []);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    };

    const sendFHIRToBackend = async () => {
        try {
            for (const entry of entries) {
                const res = await fetch("http://localhost:3001/api/enviar-mirth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_user, entry })
                });

                if (!res.ok) throw new Error("Falha ao enviar uma entrada");
            }

            alert("✅ Todas as entradas foram enviadas para o Mirth com sucesso!");
        } catch (err) {
            console.error("❌ Erro ao enviar para Mirth:", err);
            alert("Erro ao enviar dados para o Mirth.");
        }
    };

    return (
        <div style={{ background: "#fff0f5", minHeight: "100vh", padding: "60px 20px" }}>
            {/* Header com Botões */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
                <button
                    onClick={() => navigate("/user")}
                    style={{
                        backgroundColor: "#ffd4e2",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        color: "#333",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                >
                    ← Voltar
                </button>

                <button
                    onClick={sendFHIRToBackend}
                    style={{
                        backgroundColor: "#d6336c",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                >
                    Enviar FHIR para Mirth
                </button>
            </div>

            <h2 style={{ color: "#d6336c", marginBottom: "20px", textAlign: "center" }}>
                📖 Histórico de Ciclos
            </h2>

            {loading ? (
                <p style={{ textAlign: "center" }}>Carregando entradas...</p>
            ) : entries.length === 0 ? (
                <p style={{ textAlign: "center" }}>Nenhuma entrada registrada ainda.</p>
            ) : (
                <div style={{ display: "grid", gap: "20px", maxWidth: "800px", margin: "0 auto" }}>
                    {entries.map((entry) => (
                        <div
                            key={entry.id_diario}
                            style={{
                                background: "#ffe6f0",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                                textAlign: "left"
                            }}
                        >
                            <p><strong>🗓️ Data do ciclo:</strong> {formatDate(entry.data_entrada)}</p>
                            <p><strong>🩸 Status da Menstruação:</strong> {entry.menses_status}</p>
                            <p><strong>⚠️ Condições:</strong> {entry.menstrual_cycle_desc || "Nenhuma"}</p>
                            <p><strong>🎨 Cor do Sangue:</strong> {entry.color}</p>
                            <p><strong>🧬 Coágulos:</strong> {entry.blood_clots}</p>
                            <p><strong>💧 Fluxo:</strong> {entry.flow}</p>

                            <p><strong>🛌 Duração do Sono:</strong> {entry.sleep_duration} horas</p>
                            <p><strong>🌙 Qualidade do Sono:</strong> {entry.sleep_quality}</p>

                            <p><strong>🌪️ Mudanças de Humor:</strong> {entry.mood_swings}</p>
                            <p><strong>🤕 Nível de Dor:</strong> {entry.pain_level}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiaryHistory;
