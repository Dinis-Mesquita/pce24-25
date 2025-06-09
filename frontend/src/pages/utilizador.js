import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "../components/autenticacao";

const UserInfoDisplay = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const id_user = getUserIdFromToken();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/userdata/${id_user}`);
                if (!res.ok) throw new Error("Erro ao buscar dados.");
                const result = await res.json();
                setData(result);
            } catch (err) {
                setError("Não foi possível carregar os dados.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id_user]);

    const sendFHIRToBackend = async () => {
        try {
            const entry = {
                data_entrada: data.last_menstrual_period,
                flow: data.flow || "Unknown",
                menstrual_cycle_desc: data.cycle_patern,
                pain_level: data.pain_level || "Unknown",
                sleep_duration: data.sleep_duration || 0
            };

            const res = await fetch("http://localhost:3001/api/enviar-mirth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_user, entry })
            });

            if (!res.ok) throw new Error("Falha ao enviar a entrada");

            alert("✅ Informação FHIR enviada para o Mirth com sucesso!");
        } catch (err) {
            console.error("❌ Erro ao enviar para o Mirth:", err);
            alert("Erro ao enviar os dados para o Mirth.");
        }
    };

    if (loading) return <p style={styles.loading}>A carregar...</p>;
    if (error) return <p style={styles.error}>{error}</p>;
    if (!data) return <p style={styles.loading}>Nenhum dado disponível.</p>;

    return (
        <div style={styles.container}>
            <div style={styles.topButtons}>
                <button onClick={() => navigate("/user")} style={styles.backButton}>← Voltar</button>
                <button onClick={sendFHIRToBackend} style={styles.exportButton}>Enviar FHIR para Mirth</button>
            </div>

            <div style={styles.card}>
                <h2 style={styles.title}>👤 Informações do Perfil</h2>
                <ul style={styles.list}>
                    <li><strong>🗓️ Data de Nascimento:</strong> {data.data_nascimento}</li>
                    <li><strong>⚖️ Peso:</strong> {data.peso} kg</li>
                    <li><strong>📏 Altura:</strong> {data.altura} cm</li>
                    <li><strong>🔄 Duração Média do Ciclo:</strong> {data.cycle_pattern_lenght} dias</li>
                    <li><strong>📈 Padrão do Ciclo:</strong> {data.cycle_patern}</li>
                    <li><strong>🩸 Última Menstruação:</strong> {data.last_menstrual_period}</li>
                    <li><strong>💊 Contraceptivos:</strong> {data.contraceptive_status}</li>
                    <li><strong>💊 Tipo de Contraceptivo:</strong> {data.contraceptive_type || "—"}</li>
                </ul>
                <div style={styles.buttonContainer}>
                    <button style={styles.editButton} onClick={() => navigate("/user/user-info")}>📝 Editar Informações</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        background: "#fff0f5",
        minHeight: "100vh",
        padding: "60px 20px"
    },
    topButtons: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "30px"
    },
    backButton: {
        backgroundColor: "#ffd4e2",
        border: "none",
        borderRadius: "8px",
        padding: "10px 16px",
        color: "#333",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    },
    exportButton: {
        backgroundColor: "#d6336c",
        border: "none",
        borderRadius: "8px",
        padding: "10px 16px",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    },
    card: {
        background: "#fff",
        padding: "40px",
        borderRadius: "14px",
        boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        maxWidth: "500px",
        margin: "0 auto"
    },
    title: {
        color: "#d6336c",
        textAlign: "center",
        marginBottom: "30px"
    },
    list: {
        listStyle: "none",
        paddingLeft: 0,
        fontSize: "16px",
        lineHeight: "1.8"
    },
    buttonContainer: {
        marginTop: "30px",
        textAlign: "center"
    },
    editButton: {
        backgroundColor: "#70d6ff",
        border: "none",
        padding: "10px 20px",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "15px"
    },
    loading: {
        textAlign: "center",
        marginTop: "100px",
        fontSize: "18px"
    },
    error: {
        textAlign: "center",
        marginTop: "100px",
        fontSize: "18px",
        color: "red"
    }
};

export default UserInfoDisplay;
