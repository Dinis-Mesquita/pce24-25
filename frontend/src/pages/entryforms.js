import React from "react";
import { useNavigate } from "react-router-dom";
import { Form } from "protected-aidaforms";
import jdt from "../jdt_app.json";
import formDesign from "../style_app.json";
import { getUserIdFromToken } from "../components/autenticacao";
const CycleEntryForm = () => {
    const navigate = useNavigate();
    const id_user = getUserIdFromToken();

    const saveComposition = async (values) => {
        console.log("🔍 FORM VALUES RECEIVED:", values);

        try {
            let valores = values;

            if (typeof valores === "string") {
                valores = JSON.parse(valores);
            }

            // 🧠 Extracting data from form (example structure — adjust keys after testing)
            const backendData = {
                
                id_user: id_user,
                data_entrada: valores["items.0.0.items.3.value.date"], // data only
                color: valores["items.0.0.items.2.value"]?.text,
                blood_clots: valores["items.0.0.items.1.value"]?.text,
                flow: valores["items.0.0.items.0.value"]?.text,
                menstrual_cycle_des: valores["items.0.1.items.0.value"]?.text,
                sleep_duration: valores["items.0.2.items.0.value.value"], // Number of hours
                sleep_quality: valores["items.0.2.items.1.value"]?.text,
                menses_status: valores["items.0.3.items.0.value"]?.text,
                mood_swings: valores["items.0.4.items.0.value"]?.text,
                pain_level: valores["items.0.4.items.1.value"]?.text,
            };

            console.log("📦 Data being sent to backend:", backendData);

            const response = await fetch("http://localhost:3001/api/diario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(backendData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao guardar");
            }

            const result = await response.json();
            console.log("✅ Dados guardados com sucesso:", result);

            // ✅ Redirect to /user after successful submission
            navigate("/user");
        } catch (err) {
            console.error("❌ Erro ao submeter composição:", err);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#ffe6f0", paddingTop: 40 }}>
            {/* 🔙 Voltar Button */}
            <div style={{ position: "absolute", top: 20, left: 20 }}>
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
            </div>

            <div style={{ padding: 40, maxWidth: "800px", margin: "0 auto" }}>
                <div
                    style={{
                        background: "#ffd4e2",
                        padding: 30,
                        borderRadius: "12px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <h2 style={{ marginBottom: 20, color: "#333" }}>📅 Novo Ciclo</h2>
                    <p style={{ marginBottom: 30, color: "#555" }}>
                        Registre aqui as informações do seu novo ciclo menstrual.
                    </p>
                    <Form
                        template={jdt}
                        formDesign={JSON.stringify(formDesign)}
                        showPrint={false}
                        editMode={true}
                        submitButtonDisabled={false}
                        canSubmit={true}
                        onSubmit={saveComposition}
                        saveButtonDisabled={false}
                        canSave={false}
                        canCancel={false}
                        dlm={{}}
                        professionalTasks={["Guardar", "Ver", "Cancelar"]}
                    />
                </div>
            </div>
        </div>
    );
};

export default CycleEntryForm;
