import React from "react";
import { Form } from "protected-aidaforms";
import jdt from "../jdt_app.json";
import formDesign from "../style_app.json";

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

const CycleEntryForm = () => {
    return (
        <div style={{ padding: 20 }}>
            <h1>Novo Ciclo</h1>
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
                canCancel={true}
                dlm={{}}
                professionalTasks={["Guardar", "Ver", "Cancelar"]}
            />
        </div>
    );
};

export default CycleEntryForm;
