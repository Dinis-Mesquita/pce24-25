import React, { useEffect, useState } from "react";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis
} from "recharts";

const COLORS = [
    "#a1c9f4", "#ffb482", "#8de5a1", "#ff9f9b",
    "#d0bbff", "#debb9b", "#fab0e4", "#cfcfcf"
];

const chartStyle = {
    width: "45%",
    minWidth: "280px",
    height: 220,
    marginBottom: 30
};

const UserStats = ({ id_user }) => {
    const [entries, setEntries] = useState([]);
    const [cycleLengths, setCycleLengths] = useState([]);
    const [flowCounts, setFlowCounts] = useState([]);
    const [painLevels, setPainLevels] = useState([]);
    const [symptomCounts, setSymptomCounts] = useState([]);
    const [moodCounts, setMoodCounts] = useState([]);
    const [sleepQuality, setSleepQuality] = useState([]);
    const [sleepHours, setSleepHours] = useState([]);
    const [avgCycleLength, setAvgCycleLength] = useState(null);
    const [avgSleepHours, setAvgSleepHours] = useState(null);
    const [selectedRange, setSelectedRange] = useState(12);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/diario/${id_user}`);
                const data = await res.json();
                const targetDate = new Date();
                targetDate.setMonth(targetDate.getMonth() - selectedRange);
                const filteredData = data.filter(e => new Date(e.data_entrada) >= targetDate);
                setEntries(filteredData);
                processStats(data, targetDate);
            } catch (err) {
                console.error("Erro ao buscar dados para estatísticas:", err);
            }
        };

        fetchEntries();
    }, [id_user, selectedRange]);

    const processStats = (allData, startDate) => {
        // 🔁 Agrupar início real dos ciclos
        const bleedingEntriesRaw = allData
            .filter(e => (e.menses_status === "Bleeding" || e.menses_status === "bleeding") && new Date(e.data_entrada) >= startDate)
            .sort((a, b) => new Date(a.data_entrada) - new Date(b.data_entrada));

        const uniqueCycleStarts = [];
        for (let i = 0; i < bleedingEntriesRaw.length; i++) {
            const currentDate = new Date(bleedingEntriesRaw[i].data_entrada);
            const previousDate = uniqueCycleStarts.length > 0 ? new Date(uniqueCycleStarts[uniqueCycleStarts.length - 1]) : null;

            if (!previousDate || (currentDate - previousDate) / (1000 * 60 * 60 * 24) > 5) {
                uniqueCycleStarts.push(bleedingEntriesRaw[i].data_entrada);
            }
        }

        const durations = [];
        for (let i = 1; i < uniqueCycleStarts.length; i++) {
            const d1 = new Date(uniqueCycleStarts[i - 1]);
            const d2 = new Date(uniqueCycleStarts[i]);
            const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
            durations.push({ date: uniqueCycleStarts[i - 1], days: Math.round(diff) });
        }

        setCycleLengths(durations);
        setAvgCycleLength(
            durations.length > 0
                ? (durations.reduce((sum, d) => sum + d.days, 0) / durations.length).toFixed(1)
                : null
        );

        const filteredData = allData.filter(e => new Date(e.data_entrada) >= startDate);

        const flowMap = {};
        const painMap = {};
        const symptomsMap = {};
        const moodMap = {};
        const sleepMap = {};
        const sleepDurationMap = [];

        filteredData.forEach((entry) => {
            if (entry.flow) flowMap[entry.flow] = (flowMap[entry.flow] || 0) + 1;
            if (entry.pain_level) painMap[entry.pain_level] = (painMap[entry.pain_level] || 0) + 1;
            if (entry.mood_swings) moodMap[entry.mood_swings] = (moodMap[entry.mood_swings] || 0) + 1;
            if (entry.sleep_quality) sleepMap[entry.sleep_quality] = (sleepMap[entry.sleep_quality] || 0) + 1;
            if (entry.sleep_duration !== undefined && !isNaN(entry.sleep_duration)) {
                sleepDurationMap.push({ date: entry.data_entrada, hours: Number(entry.sleep_duration) });
            }

            if (entry.menstrual_cycle_desc) {
                const terms = entry.menstrual_cycle_desc.split(",");
                terms.forEach(term => {
                    const trimmed = term.trim();
                    if (trimmed) symptomsMap[trimmed] = (symptomsMap[trimmed] || 0) + 1;
                });
            }
        });

        sleepDurationMap.sort((a, b) => new Date(a.date) - new Date(b.date));

        setFlowCounts(Object.entries(flowMap).map(([name, value]) => ({ name, value })));
        setPainLevels(Object.entries(painMap).map(([name, value]) => ({ name, value })));
        setSymptomCounts(Object.entries(symptomsMap).map(([name, value]) => ({ name, value })).slice(0, 5));
        setMoodCounts(Object.entries(moodMap).map(([name, value]) => ({ name, value })));
        setSleepQuality(Object.entries(sleepMap).map(([name, value]) => ({ name, value })));
        setSleepHours(sleepDurationMap);

        setAvgSleepHours(
            sleepDurationMap.length > 0
                ? (sleepDurationMap.reduce((sum, s) => sum + s.hours, 0) / sleepDurationMap.length).toFixed(1)
                : null
        );
    };

    const renderPieChart = (title, data, colorOffset = 0) => (
        <div style={{ ...chartStyle, flex: '1 1 calc(50% - 20px)' }}>
            <h4 style={{ color: "#555", whiteSpace: 'nowrap' }}>{title}</h4>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={65}
                        labelLine={false}
                        label={({ name }) => name}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + colorOffset) % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value, name) => [`${value}`, name]}
                        contentStyle={{ backgroundColor: '#fdfdfd', borderColor: '#aaa', color: '#222' }}
                        itemStyle={{ fontWeight: 500 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <div style={{ marginTop: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <label style={{ marginRight: 10 }}>⏱️ Período:</label>
                <select value={selectedRange} onChange={e => setSelectedRange(Number(e.target.value))}>
                    <option value={3}>Últimos 3 meses</option>
                    <option value={6}>Últimos 6 meses</option>
                    <option value={12}>Últimos 12 meses</option>
                </select>
            </div>

            <div style={{
                backgroundColor: '#ffffff',
                padding: '20px 30px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                marginBottom: '30px',
                textAlign: 'center',
                color: '#333',
                maxWidth: '700px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                <h3 style={{ color: '#d6336c', marginBottom: '10px' }}>📋 Resumo Geral (últimos {selectedRange} meses)</h3>
                <p><strong>🩸 Fluxo mais frequente:</strong> {flowCounts.sort((a,b)=>b.value-a.value)[0]?.name || '—'}</p>
                <p><strong>🤕 Nível de dor mais comum:</strong> {painLevels.sort((a,b)=>b.value-a.value)[0]?.name || '—'}</p>
                <p><strong>⚠️ Sintoma mais registado:</strong> {symptomCounts.sort((a,b)=>b.value-a.value)[0]?.name || '—'}</p>
                <p><strong>🌪️ Estado de humor mais habitual:</strong> {moodCounts.sort((a,b)=>b.value-a.value)[0]?.name || '—'}</p>
                <p><strong>🛌 Qualidade de sono mais frequente:</strong> {sleepQuality.sort((a,b)=>b.value-a.value)[0]?.name || '—'}</p>
                <p><strong>📆 Média da duração do ciclo:</strong> {avgCycleLength ? `${avgCycleLength} dias` : '—'}</p>
                <p><strong>⏱️ Média de horas de sono:</strong> {avgSleepHours ? `${avgSleepHours} horas` : '—'}</p>
            </div>

            <h3 style={{ color: "#d6336c", marginBottom: 20 }}>📊 Estatísticas Recentes</h3>

            {cycleLengths.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
                    <div style={{ width: "60%" }}>
                        <h4 style={{ color: "#555" }}>📆 Duração dos Ciclos {avgCycleLength && `(Média: ${avgCycleLength} dias)`}</h4>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={cycleLengths}>
                                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
                                <YAxis />
                                <Tooltip formatter={(v) => `${v} dias`} labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                                <Line type="monotone" dataKey="days" stroke="#d6336c" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "20px" }}>
                {renderPieChart("🩸 Fluxo", flowCounts)}
                {renderPieChart("🤕 Dor", painLevels, 1)}
                {renderPieChart("⚠️ Sintomas", symptomCounts, 2)}
                {renderPieChart("🌪️ Humor", moodCounts, 3)}
                {renderPieChart("🛌 Qualidade do Sono", sleepQuality, 4)}
                {sleepHours.length > 0 && (
                    <div style={{ ...chartStyle, width: "43%", height: 180, flex: '1 1 calc(45% - 20px)', textAlign: 'center' }}>
                        <h4 style={{ color: "#555" }}>⏱️ Duração do Sono (em horas) {avgSleepHours && `(Média: ${avgSleepHours}h)`}</h4>
                        <ResponsiveContainer width="100%" height={160}>
                            <LineChart data={sleepHours}>
                                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
                                <YAxis label={{ value: "Horas", angle: -90, position: "insideLeft" }} />
                                <Tooltip formatter={(v) => `${v} horas`} labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                                <Line type="monotone" dataKey="hours" stroke="#70d6ff" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserStats;
