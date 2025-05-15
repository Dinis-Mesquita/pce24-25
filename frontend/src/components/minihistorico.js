// src/components/MiniHistory.js
import React, { useEffect, useState } from "react";

const MiniHistory = ({ id_user }) => {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/diario/${id_user}`);
                const data = await res.json();
                setEntries(data.slice(0, 5)); // Only show latest 5
            } catch (err) {
                console.error("Erro ao buscar histórico:", err);
            }
        };

        fetchEntries();
    }, [id_user]);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    };

    return (
        <div style={{ marginTop: "40px" }}>
            <h3 style={{ color: "#d6336c" }}>🕘 Últimos Ciclos</h3>
            {entries.length === 0 ? (
                <p>Nenhuma entrada ainda.</p>
            ) : (
                <ul style={{ marginTop: "20px", padding: 0, listStyle: "none" }}>
                    {entries.map((entry) => (
                        <li
                            key={entry.id_diario}
                            style={{
                                background: "#fff",
                                borderRadius: "8px",
                                marginBottom: "12px",
                                padding: "10px",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                                textAlign: "left"
                            }}
                        >
                            <strong>🗓️{formatDate(entry.data_entrada)}</strong><br />
                            <span style={{ fontSize: '0.9em', color: '#555' }}>
                                🩸 <strong>Status da Menstruação:</strong> {entry.menses_status} |{" "}
                                ⚠️ <strong>Condições:</strong> {entry.menstrual_cycle_desc || "Nenhuma"} |{" "}
                                🎨 <strong>Cor do Sangue:</strong> {entry.color} |{" "}
                                🧬 <strong>Coágulos:</strong> {entry.blood_clots} |{" "}
                                💧 <strong>Fluxo:</strong> {entry.flow} |{" "}

                                🛌 <strong>Duração do Sono:</strong> {entry.sleep_duration}h |{" "}
                                🌙 <strong>Qualidade do Sono:</strong> {entry.sleep_quality} |{" "}

                                🌪️ <strong>Mudanças de Humor:</strong> {entry.mood_swings} |{" "}
                                🤕 <strong>Nível de Dor:</strong> {entry.pain_level}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MiniHistory;
