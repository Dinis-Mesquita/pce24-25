import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import ptLocale from "@fullcalendar/core/locales/pt";
import "@fullcalendar/daygrid/main.css";

const PeriodCalendar = () => {
    const [events, setEvents] = useState([]);
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                const id_user = localStorage.getItem("id_user");
                if (!id_user) throw new Error("ID do utilizador não encontrado");

                const res = await fetch(`http://localhost:3001/api/calendar/${id_user}`);

                if (!res.ok) throw new Error("Erro ao buscar dados do calendário");

                const data = await res.json();

                const eventsList = [];

                data.periodDates.forEach(date => {
                    eventsList.push({
                        title: "🩸 Menstruação",
                        start: date,
                        allDay: true,
                        color: "#ff6f91",
                        extendedProps: { tooltip: "Fase de sangramento do ciclo menstrual." }
                    });
                });

                eventsList.push({
                    title: "📍 Próximo período",
                    start: data.nextPredictedPeriod,
                    allDay: true,
                    color: "#9b5de5",
                    extendedProps: { tooltip: "Previsão do início do próximo ciclo menstrual." }
                });

                eventsList.push({
                    title: "💧 Ovulação",
                    start: data.ovulationDate,
                    allDay: true,
                    color: "#3a86ff",
                    extendedProps: { tooltip: "Fase de ovulação: aumento da fertilidade." }
                });

                eventsList.push({
                    title: "Fase Folicular",
                    start: data.follicularStart,
                    end: data.follicularEnd,
                    color: "#70d6ff",
                    display: 'background',
                    extendedProps: { tooltip: "Fase de preparação para ovulação, geralmente melhora de humor e energia." }
                });

                eventsList.push({
                    title: "Fase Lútea",
                    start: data.lutealStart,
                    end: data.lutealEnd,
                    color: "#ffd670",
                    display: 'background',
                    extendedProps: { tooltip: "Fase após a ovulação, sintomas de TPM como sensibilidade, cansaço e irritabilidade." }
                });

                eventsList.push({
                    title: "🌟Período Fértil",
                    start: data.fertileStart,
                    end: data.fertileEnd,
                    color: "#caffbf",
                    display: 'background',
                    extendedProps: { tooltip: "Janela de maior probabilidade de gravidez." }
                });

                setEvents(eventsList);
                setAlertMessage(data.alertMessage);

            } catch (err) {
                console.error("Erro ao carregar calendário:", err);
            }
        };

        fetchCalendarData();
    }, []);

    const renderTooltip = (arg) => {
        const tooltip = arg.event.extendedProps?.tooltip;
        if (tooltip) {
            arg.el.setAttribute("title", tooltip);
        }
    };

    return (
        <div style={{ marginTop: 40, maxWidth: "900px", margin: "0 auto" }}>
            {alertMessage && (
                <div style={{
                    padding: "10px",
                    backgroundColor: "#ffe066",
                    border: "1px solid #f0c36d",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    textAlign: "center",
                    fontWeight: "bold"
                }}>
                    🔔 {alertMessage}
                </div>
            )}

            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="auto"
                locale={ptLocale}
                eventDidMount={renderTooltip}
                headerToolbar={{
                    start: "prev,next today",
                    center: "title",
                    end: ""
                }}
            />
        </div>
    );
};

export default PeriodCalendar;










/*
Fases do ciclo estimadas
Vamos usar como base o modelo clínico comum (em ciclos de ~28 dias):

Fase	Dias após 1º dia	Duração aproximada
🩸 Menstrual	0–4	~5 dias
🌱 Folicular	5–12	~8 dias
💥 Ovulação	13–15	~3 dias
🌙 Lútea	16–28	~14 dias

✅ 3. Qual é o ponto de partida para as fases?
Conta-se sempre a partir do primeiro dia do último sangramento (menses_status = 'Bleeding').

Portanto:

Dia 1 = início do período

Ovulação estimada = Dia 14 (em média)

Fase lútea = a seguir à ovulação, até ao próximo período

✅ Exemplo real:
Se a última menstruação começou em 2025-06-02 e o ciclo médio for 29 dias:

Data estimada	Evento
2025-06-02	🩸 Início do período
2025-06-06	🌱 Início fase folicular
2025-06-15	💥 Ovulação
2025-06-29	🌙 Fase lútea final
2025-07-01	🩸 Previsão novo ciclo
 */