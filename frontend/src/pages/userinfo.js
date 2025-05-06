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
        <div style={{ padding: 20 }}>
            <h1>Informações Iniciais</h1>
            <Form
                template={jdt}
                formDesign={JSON.stringify(formDesign)}
                showPrint={false}
                editMode={true}
                submitButtonDisabled={false}
                canSubmit={true}
                onSubmit={(values) => saveComposition(values)}
                saveButtonDisabled={false}
                canSave={false}
                canCancel={true}
                dlm={{}}
                professionalTasks={["Guardar", "Ver", "Cancelar"]}
            />
        </div>
    );
};

export default UserInfoForm;
