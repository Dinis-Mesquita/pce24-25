//bibliotecas
// npm install express pg cors dotenv axios express-validator jsonwebtoken
// npm install --save-dev nodemon
//no frontend: npm install @fullcalendar/react@5.11.3 @fullcalendar/daygrid@5.11.3 @fullcalendar/core@5.11.3
// npm install react-tooltip-lite
//npm install recharts

require('dotenv').config(); //Carregar variáveis de ambiente do arquivo .env para process.env

const express = require('express'); //Importar o Express (framework para criar servidores web e APIs)
const { Pool } = require('pg'); //Importar o pg (cliente PostgreSQL para Node.js)
const axios = require('axios'); // Importar Axios (cliente HTTP para requisições externas)
const cors = require('cors'); // Importar o CORS (permite requisições entre diferentes domínios)
const { body, validationResult } = require('express-validator'); // Importar Express Validator (validação e sanitização de dados)
const bcrypt = require("bcrypt"); //encripta password



const { v4: uuidv4 } = require("uuid"); //atribui ids para as keys e assim



const app = express(); // framework para Node.js usado para criar servidores web e APIs
const port = 3001;


// Middleware para permitir JSON e formulários
app.use(express.json({
    type: ['application/json', 'application/json-patch+json'] // Add other types if needed
}));

app.use((req, res, next) => {
    console.log('Request Headers:', req.headers);
    console.log('Raw Body:', req.body);
    next();
});

app.use(express.urlencoded({ extended: true }));
// da parse do json

//app.use(cors());

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);



// Configuração do PostgreSQL
const pool = new Pool({
    user: "nextgen_user",
    host: "localhost",
    database: "proj_final",
    password: "nextgen_password",
    port: 5432,
});




//entrada do diario
app.post("/api/diario", async (req, res) => {
    console.log("📥 Received data:", req.body);

    const {
        id_user,
        data_entrada,
        color,
        blood_clots,
        flow,
        menstrual_cycle_des,
        sleep_duration,
        sleep_quality,
        menses_status,
        mood_swings,
        pain_level
    } = req.body;

    const client = await pool.connect();

    try {
        const result = await client.query(
            `INSERT INTO "menstrual_diary" (
                id_user,
                data_entrada,
                color,
                blood_clots,
                flow,
                menstrual_cycle_desc,
                sleep_duration,
                sleep_quality,
                menses_status,
                mood_swings,
                pain_level
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;`,
            [
                id_user,
                data_entrada,
                color,
                blood_clots,
                flow,
                menstrual_cycle_des,
                sleep_duration,
                sleep_quality,
                menses_status,
                mood_swings,
                pain_level
            ]
        );

        res.json({
            message: "Dados do diário armazenados com sucesso!",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("❌ Erro na base de dados:", error);
        res.status(500).json({
            error: "Erro ao processar os dados",
            details: error.message,
        });
    } finally {
        client.release();
    }
});

app.get("/api/diario/:id_user", async (req, res) => {
    const { id_user } = req.params;
    const client = await pool.connect();

    try {
        console.log("🔍 Fetching entries for user ID:", id_user);
        const result = await client.query(
            `SELECT * FROM "menstrual_diary" WHERE id_user = $1 ORDER BY data_entrada DESC`,
            [id_user]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        res.status(500).json({ error: "Erro ao buscar entradas" });
    } finally {
        client.release();
    }
});



const jwt = require("jsonwebtoken"); // Make sure this is already imported
const SECRET = "pce"; // You can load this from .env for security

// REGISTER
app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;

    const client = await pool.connect();
    try {
        const check = await client.query(
            `SELECT * FROM "user" WHERE email = $1`,
            [email]
        );
        if (check.rows.length > 0) {
            return res.status(409).json({ message: "Email já registrado." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await client.query(
            `INSERT INTO "user" (email, password) VALUES ($1, $2) RETURNING id_user`,
            [email, hashedPassword]
        );

        const id_user = result.rows[0].id_user;

        const token = jwt.sign({ id_user, email }, SECRET, {
            expiresIn: "2h",
        });

        res.status(201).json({
            message: "Usuário registrado com sucesso!",
            id_user,
            token,
        });
    } catch (err) {
        console.error("Erro no registro:", err);
        res.status(500).json({ message: "Erro ao registrar usuário." });
    } finally {
        client.release();
    }
});


// LOGIN
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const client = await pool.connect();
    try {
        const result = await client.query(`SELECT * FROM "user" WHERE email = $1`, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Senha incorreta." });
        }

        const token = jwt.sign({ id_user: user.id_user, email: user.email }, SECRET, {
            expiresIn: "2h",
        });

        res.json({ token, id_user: user.id_user });
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ message: "Erro no login." });
    } finally {
        client.release();
    }
});


// Route to receive menstrual cycle data from forms // Perguntas iniciais
app.post("/api/dados_inicial", async (req, res) => {
    console.log("Received data:", req.body);

    const {
        id_user,
        data_nascimento,
        peso,
        altura,
        cycle_length,
        typical_cycle,
        last_menstrual_period,
        contracetivos,
        contraceptive_type
    } = req.body;

    const client = await pool.connect();

    try {
        // Verificar se já existe entrada
        const existing = await client.query(
            `SELECT 1 FROM "User_data" WHERE id_user = $1`,
            [id_user]
        );

        let result;

        if (existing.rowCount > 0) {
            // Se existir, faz update
            result = await client.query(
                `UPDATE "User_data"
                 SET data_nascimento = $2,
                     peso = $3,
                     altura = $4,
                     cycle_pattern_lenght = $5,
                     last_menstrual_period = $6,
                     cycle_patern = $7,
                     contraceptive_status = $8,
                     contraceptive_type = $9
                 WHERE id_user = $1
                 RETURNING *;`,
                [
                    id_user,
                    data_nascimento,
                    peso,
                    altura,
                    cycle_length,
                    last_menstrual_period,
                    typical_cycle,
                    contracetivos,
                    contraceptive_type || null
                ]
            );
        } else {
            // Se não existir, insere
            result = await client.query(
                `INSERT INTO "User_data" (
                    id_user,
                    data_nascimento,
                    peso,
                    altura,
                    cycle_pattern_lenght,
                    last_menstrual_period,
                    cycle_patern,
                    contraceptive_status,
                    contraceptive_type
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *;`,
                [
                    id_user,
                    data_nascimento,
                    peso,
                    altura,
                    cycle_length,
                    last_menstrual_period,
                    typical_cycle,
                    contracetivos,
                    contraceptive_type || null
                ]
            );
        }

        res.json({
            message: "Dados armazenados com sucesso!",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Erro na db:", error);
        res.status(500).json({ error: "Erro ao processar os dados", details: error.message });
    } finally {
        client.release();
    }
});


app.get("/api/calendar/:id_user", async (req, res) => {
    const { id_user } = req.params;
    const client = await pool.connect();
    const formatDate = (date) => new Date(date).toLocaleDateString("sv-SE");

    try {
        const result = await client.query(`
            SELECT data_entrada
            FROM (
                     SELECT data_entrada, LAG(data_entrada) OVER (ORDER BY data_entrada) AS prev_date
                     FROM menstrual_diary
                     WHERE id_user = $1 AND menses_status = 'Bleeding'
                 ) t
            WHERE prev_date IS NULL OR data_entrada - prev_date > 5
            ORDER BY data_entrada ASC
        `, [id_user]);

        const periodDates = result.rows.map(r => formatDate(r.data_entrada));
        if (periodDates.length === 0) {
            return res.json({ periodDates: [], alertMessage: "Nenhuma entrada de menstruação encontrada." });
        }

        const cycleStats = await client.query(`
            SELECT AVG(ciclo) AS media
            FROM (
                     SELECT data_entrada - LAG(data_entrada) OVER (ORDER BY data_entrada) AS ciclo
                     FROM (
                              SELECT data_entrada
                              FROM (
                                       SELECT data_entrada, LAG(data_entrada) OVER (ORDER BY data_entrada) AS prev_date
                                       FROM menstrual_diary
                                       WHERE id_user = $1 AND menses_status = 'Bleeding'
                                   ) t
                              WHERE prev_date IS NULL OR data_entrada - prev_date > 5
                              ORDER BY data_entrada DESC
                                  LIMIT 4
                          ) recent
                 ) sub
            WHERE ciclo IS NOT NULL
        `, [id_user]);

        let averageCycle = parseInt(cycleStats.rows[0].media);
        if (!averageCycle || isNaN(averageCycle)) averageCycle = 28;

        const lastBleedingDateStr = periodDates[periodDates.length - 1];
        const lastBleedingDate = new Date(lastBleedingDateStr);
        const nextPredictedDate = new Date(lastBleedingDate);
        nextPredictedDate.setDate(nextPredictedDate.getDate() + averageCycle);

        const nextRealBleeding = await client.query(
            `SELECT data_entrada FROM menstrual_diary WHERE id_user = $1 AND menses_status = 'Bleeding' AND data_entrada > $2 ORDER BY data_entrada ASC LIMIT 1`,
            [id_user, lastBleedingDateStr]
        );
        const skipPrediction = nextRealBleeding.rows.length > 0 &&
            new Date(nextRealBleeding.rows[0].data_entrada) <= nextPredictedDate;

        const createPhases = (startDate) => {
            const events = [];

            const menstruationStart = new Date(startDate);
            const menstruationEnd = new Date(menstruationStart);
            menstruationEnd.setDate(menstruationEnd.getDate() + 4); // 5 dias

            const follicularStart = new Date(menstruationEnd);
            follicularStart.setDate(follicularStart.getDate() + 1);
            const follicularEnd = new Date(follicularStart);
            follicularEnd.setDate(follicularEnd.getDate() + 6); // 7 dias

            const fertileStart = new Date(follicularEnd);
            fertileStart.setDate(fertileStart.getDate() + 1);
            const fertileEnd = new Date(fertileStart);
            fertileEnd.setDate(fertileEnd.getDate() + 5); // 6 dias

            const ovulation = new Date(fertileStart); // primeiro dia fértil

            const lutealStart = new Date(fertileEnd);
            lutealStart.setDate(lutealStart.getDate() + 1);
            const lutealEnd = new Date(lutealStart);
            lutealEnd.setDate(lutealStart.getDate() + (averageCycle - 18)); // 28 - (5+7+6) = 10 dias

            events.push(
                { title: "🌟 Período Fértil", start: formatDate(fertileStart), end: formatDate(fertileEnd), color: "#caffbf", display: "background" },
                { title: "Fase Menstrual", start: formatDate(menstruationStart), end: formatDate(menstruationEnd), color: "#ff758e", display: "background" },
                { title: "Fase Folicular", start: formatDate(follicularStart), end: formatDate(follicularEnd), color: "#70d6ff", display: "background" },
                { title: "Fase Lútea", start: formatDate(lutealStart), end: formatDate(lutealEnd), color: "#ffd670", display: "background" },
                { title: "💧 Ovulação", start: formatDate(ovulation), allDay: true, color: "#3a86ff" }
            );

            return {
                menstrualStart: formatDate(menstruationStart),
                menstrualEnd: formatDate(menstruationEnd),
                follicularStart: formatDate(follicularStart),
                follicularEnd: formatDate(follicularEnd),
                fertileStart: formatDate(fertileStart),
                fertileEnd: formatDate(fertileEnd),
                lutealStart: formatDate(lutealStart),
                lutealEnd: formatDate(lutealEnd),
                ovulationDate: formatDate(ovulation),
                events
            };
        };

        const {
            menstrualStart,
            menstrualEnd,
            follicularStart,
            follicularEnd,
            fertileStart,
            fertileEnd,
            lutealStart,
            lutealEnd,
            ovulationDate,
            events: currentPhases
        } = !skipPrediction ? createPhases(lastBleedingDate) : {};

        const pastPhases = [];
        for (let i = 0; i < periodDates.length - 1; i++) {
            const baseDate = new Date(periodDates[i]);
            const { events } = createPhases(baseDate);
            pastPhases.push(...events);
        }

        const today = new Date();
        const todayStr = formatDate(today);
        let alert = "";

        const isBetween = (target, start, end) => {
            const d = new Date(target);
            return d >= new Date(start) && d <= new Date(end);
        };

        if (!skipPrediction) {
            if (isBetween(todayStr, fertileStart, fertileEnd)) {
                alert = "Está no período fértil.";
            } else if (todayStr === ovulationDate) {
                alert = "Hoje é o dia estimado da ovulação.";
            } else if (todayStr === formatDate(nextPredictedDate)) {
                alert = "Hoje pode marcar o início do próximo período.";
            }
        }

        res.json({
            periodDates,
            nextPredictedPeriod: skipPrediction ? null : formatDate(nextPredictedDate),
            ovulationDate: skipPrediction ? null : ovulationDate,
            menstrualStart,
            menstrualEnd,
            follicularStart,
            follicularEnd,
            fertileStart,
            fertileEnd,
            lutealStart,
            lutealEnd,
            pastPhases,
            alertMessage: alert
        });

    } catch (err) {
        console.error("❌ Erro ao obter dados do calendário:", err);
        res.status(500).json({ error: "Erro interno do servidor." });
    } finally {
        client.release();
    }
});








app.get("/api/userdata/:id_user", async (req, res) => {
    const { id_user } = req.params;
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT *
            FROM "User_data"
            WHERE id_user = $1
        `, [id_user]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Dados não encontrados." });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao buscar dados do utilizador:", err);
        res.status(500).json({ error: "Erro no servidor." });
    } finally {
        client.release();
    }
});









        app.post('/api/test', (req, res) => {
    console.log("Received body:", req.body);
    res.json({ received: req.body });
});
app.listen(port, () => {
    console.log(`Servidor a correr em http://localhost:${port}`);
});