import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import ptLocale from "@fullcalendar/core/locales/pt";
import "@fullcalendar/daygrid/main.css";

const PeriodCalendar = () => {
    const [events, setEvents] = useState([]);
    const [alertMessage, setAlertMessage] = useState("");
    const [showFollicular, setShowFollicular] = useState(true);
    const [showLuteal, setShowLuteal] = useState(true);
    const [faseHoje, setFaseHoje] = useState("");

    const addOneDay = (dateStr) => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split("T")[0];
    };

    const sintomasFase = {
        "Fase Menstrual": {
            texto: "Poderás sentir cólicas, cansaço, dores lombares e alterações intestinais.",
            cor: "#ffcccb"
        },
        "Fase Folicular": {
            texto: "Esta fase tende a trazer mais energia, clareza mental e bom humor.",
            cor: "#d0f0fd"
        },
        "Fase Lútea": {
            texto: "É comum ocorrerem sintomas como irritabilidade, dores de cabeça, inchaço e desejos alimentares.",
            cor: "#fff3cd"
        },
        "🌟Período Fértil": {
            texto: "Poderás sentir aumento da libido, sensibilidade mamária e mais disposição física.",
            cor: "#e2f7e1"
        }
    };

    const getFaseAtualHoje = (fases) => {
        const hoje = new Date();
        const format = (d) => d.toISOString().split("T")[0];
        const dataHoje = format(hoje);
        const f = (str) => str && format(new Date(str));

        if (f(fases.menstrualStart) <= dataHoje && dataHoje <= f(fases.menstrualEnd)) return "Fase Menstrual";
        if (f(fases.follicularStart) <= dataHoje && dataHoje <= f(fases.follicularEnd)) return "Fase Folicular";
        if (f(fases.fertileStart) <= dataHoje && dataHoje <= f(fases.fertileEnd)) return "🌟Período Fértil";
        if (f(fases.lutealStart) <= dataHoje && dataHoje <= f(fases.lutealEnd)) return "Fase Lútea";

        return "";
    };

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
                        title: "🩸Menstruação",
                        start: date,
                        allDay: true,
                        color: "#ff6f91",
                        extendedProps: {
                            tooltip: "Início do ciclo menstrual real"
                        }
                    });
                });

                if (data.nextPredictedPeriod) {
                    eventsList.push({
                        title: "📌Próximo ciclo",
                        start: data.nextPredictedPeriod,
                        allDay: true,
                        color: "#9b5de5",
                        extendedProps: {
                            tooltip: "Previsão do próximo início de ciclo"
                        }
                    });
                }

                if (data.nextPredictedPeriod && data.ovulationDate) {
                    eventsList.push({
                        title: "💧Ovulação",
                        start: data.ovulationDate,
                        allDay: true,
                        color: "#3a86ff",
                        extendedProps: {
                            tooltip: "Data estimada de ovulação"
                        }
                    });
                }

                if (data.menstrualStart && data.menstrualEnd) {
                    eventsList.push({
                        title: "Fase Menstrual",
                        start: data.menstrualStart,
                        end: addOneDay(data.menstrualEnd),
                        color: "#ff758e",
                        display: "background"
                    });
                }

                if (data.follicularStart && data.follicularEnd && showFollicular) {
                    eventsList.push({
                        title: "Fase Folicular",
                        start: data.follicularStart,
                        end: addOneDay(data.follicularEnd),
                        color: "#70d6ff",
                        display: "background"
                    });
                }

                if (data.lutealStart && data.lutealEnd && showLuteal) {
                    eventsList.push({
                        title: "Fase Lútea",
                        start: data.lutealStart,
                        end: addOneDay(data.lutealEnd),
                        color: "#ffd670",
                        display: "background"
                    });
                }

                if (data.fertileStart && data.fertileEnd) {
                    eventsList.push({
                        title: "🌟Período Fértil",
                        start: data.fertileStart,
                        end: addOneDay(data.fertileEnd),
                        color: "#caffbf",
                        display: "background"
                    });
                }

                if (data.pastPhases) {
                    const adjustedPhases = data.pastPhases.map(ev => {
                        const shouldInclude =
                            ev.title === "Fase Folicular" ? showFollicular :
                                ev.title === "Fase Lútea" ? showLuteal : true;

                        return shouldInclude && ev.display === "background" && ev.end
                            ? { ...ev, end: addOneDay(ev.end) }
                            : shouldInclude ? ev : null;
                    }).filter(Boolean);

                    eventsList.push(...adjustedPhases);
                }

                setEvents(eventsList);

                const faseAtual = getFaseAtualHoje(data);
                setFaseHoje(faseAtual);

                if (data.nextPredictedPeriod) {
                    const today = new Date();
                    const nextCycle = new Date(data.nextPredictedPeriod);
                    nextCycle.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);
                    const diffTime = nextCycle.getTime() - today.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 0) {
                        setAlertMessage("🔔Hoje pode marcar o início do próximo período! Não se esqueça de registar!");
                    } else if (diffDays > 0 && diffDays <= 5) {
                        setAlertMessage(`🕒 Falta ${diffDays} dia(s)${diffDays > 1 ? "s" : ""} para o próximo ciclo menstrual! Não se esqueça de registar!`);
                    } else {
                        setAlertMessage(data.alertMessage || "");
                    }
                } else {
                    setAlertMessage(data.alertMessage || "");
                }

            } catch (err) {
                console.error("❌ Erro ao carregar calendário:", err);
                setEvents([]);
            }
        };

        setEvents([]);
        fetchCalendarData();
    }, [showFollicular, showLuteal]);

    const renderTooltip = (arg) => {
        const tooltip = arg.event.extendedProps?.tooltip;
        if (tooltip) {
            arg.el.setAttribute("title", tooltip);
        }
    };

    return (
        <div style={{ marginTop: 40, maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <label>
                    <input
                        type="checkbox"
                        checked={showFollicular}
                        onChange={() => setShowFollicular(!showFollicular)}
                    /> Mostrar Fase Folicular
                </label>
                <label style={{ marginLeft: "20px" }}>
                    <input
                        type="checkbox"
                        checked={showLuteal}
                        onChange={() => setShowLuteal(!showLuteal)}
                    /> Mostrar Fase Lútea
                </label>
            </div>

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
                    {alertMessage}
                </div>
            )}

            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="auto"
                locale={ptLocale}
                eventDidMount={renderTooltip}
                dayCellDidMount={(arg) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const cellDate = new Date(arg.date);
                    cellDate.setHours(0, 0, 0, 0);

                    if (cellDate.getTime() === today.getTime()) {
                        const frame = arg.el.querySelector(".fc-daygrid-day-frame");
                        if (frame) {
                            frame.style.border = "2px solid #000000";
                            frame.style.borderRadius = "8px";
                            frame.style.boxSizing = "border-box";
                        }
                    }
                }}
                headerToolbar={{
                    start: "prev,next today",
                    center: "title",
                    end: ""
                }}
            />

            {faseHoje && sintomasFase[faseHoje] && (
                <div style={{
                    marginTop: "25px",
                    padding: "15px",
                    backgroundColor: sintomasFase[faseHoje].cor,
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    textAlign: "center"
                }}>
                    📌 Hoje estás na <span style={{ textDecoration: "underline" }}>{faseHoje}</span>. {sintomasFase[faseHoje].texto}
                </div>
            )}
        </div>
    );
};

export default PeriodCalendar;
