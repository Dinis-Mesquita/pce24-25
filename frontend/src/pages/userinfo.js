import React from "react";
import { Form } from "protected-aidaforms";
import jdt from "../jdt_user.json";
import formDesign from "../style_user.json";

const saveComposition = async (values) => {
    console.log("🔍 FORM VALUES RECEIVED:", values);

    try {
        let valores = values;

        if (typeof valores === "string") {
            valores = JSON.parse(valores);
        }

        // 1. Extract all values with proper null checks
        const backendData = {
            id_user: 2,
            data_nascimento: valores["items.0.0.items.0.value"],
            peso: valores["items.0.1.items.0.value.value"],
            altura: valores["items.0.4.items.0.value.value"],
            cycle_length: valores["items.0.2.items.1.value.value"],
            typical_cycle: valores["items.0.2.items.0.value"]?.text,
            last_menstrual_period: valores["items.0.5.items.0.value"],
            contracetivos: valores["items.0.3.items.0.value"]?.text,
            contraceptive_type:
                valores["items.0.3.items.1.value"]?.[0]?.values?.["items.0.3.items.1.items.0.value"]?.text || null, // ✅ Type
        };

        console.log("📦 Data being sent to backend:", backendData);

        const response = await fetch("http://localhost:3001/api/dados_inicial", {
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
        return result;

    } catch (err) {
        console.error("❌ Erro ao submeter composição:", err);
        throw err;
    }
};

const UserInfoForm = () => {
    return (
        <div style={{ minHeight: "100vh", background: "#ffe6f0", paddingTop: 40 }}>
            <div style={{ padding: 40, maxWidth: "800px", margin: "0 auto" }}>
                <div
                    style={{
                        background: "#ffd4e2",
                        padding: 30,
                        borderRadius: "12px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <h2 style={{ marginBottom: 20, color: "#333" }}>👩 Informações Iniciais</h2>
                    <p style={{ marginBottom: 30, color: "#555" }}>
                        Por favor preencha seus dados para começarmos a acompanhar o seu ciclo.
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

export default UserInfoForm;
