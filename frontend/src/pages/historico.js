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

    const exportToFHIR = () => {
        const fhirBundle = {
            resourceType: "Bundle",
            type: "collection",
            entry: entries.map(entry => ({
                resource: createObservationResource(entry)
            }))
        };

        downloadAsJSON(fhirBundle, `menstrual-history-${new Date().toISOString().split('T')[0]}.json`);
    };

    const createObservationResource = (entry) => {
        return {
            resourceType: "Observation",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "survey",
                    display: "Survey"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "49033-4",
                    display: "Menstrual cycle"
                }]
            },
            subject: {
                reference: `Patient/${id_user}`
            },
            effectiveDateTime: entry.data_entrada,
            component: [
                {
                    code: {
                        coding: [{
                            system: "http://loinc.org",
                            code: "84756-9",
                            display: "Menstrual flow"
                        }]
                    },
                    valueString: entry.flow
                },
                {
                    code: {
                        coding: [{
                            system: "http://loinc.org",
                            code: "75322-8",
                            display: "Menstrual symptoms"
                        }]
                    },
                    valueString: entry.menstrual_cycle_desc || "None"
                },
                {
                    code: {
                        coding: [{
                            system: "http://loinc.org",
                            code: "72514-3",
                            display: "Pain severity"
                        }]
                    },
                    valueString: entry.pain_level
                },
                {
                    code: {
                        coding: [{
                            system: "http://loinc.org",
                            code: "68502-2",
                            display: "Sleep duration"
                        }]
                    },
                    valueString: `${entry.sleep_duration} hours`
                }
            ]
        };
    };

    const downloadAsJSON = (data, filename) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ background: "#fff0f5", minHeight: "100vh", padding: "60px 20px" }}>
            {/* Header with Back and Export buttons */}
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
                    onClick={exportToFHIR}
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
                    Exportar FHIR/LOINC
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