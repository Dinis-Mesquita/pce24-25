import React from "react";
import { Form } from "protected-aidaforms";
import jdt from "../jdt_user.json";
import formDesign from "../style_user.json";

const saveComposition = async (values) => {
    try {
        const response = await fetch("http://localhost:5001/api/compositions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ composition: values }),
        });

        if (!response.ok) throw new Error("Erro ao guardar");
        const result = await response.json();
        console.log("Guardado com sucesso:", result);
    } catch (err) {
        console.error("Erro ao submeter composição:", err);
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