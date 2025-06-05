//bibliotecas
// npm install express pg cors dotenv axios express-validator jsonwebtoken
// npm install --save-dev nodemon
//no frontend: npm install @fullcalendar/react@5.11.3 @fullcalendar/daygrid@5.11.3 @fullcalendar/core@5.11.3
// npm install react-tooltip-lite

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
        const result = await client.query(
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

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('sv-SE'); // formato YYYY-MM-DD, respeita timezone

    try {
        const result = await client.query(`
            SELECT data_entrada
            FROM menstrual_diary
            WHERE id_user = $1 AND menses_status = 'Bleeding'
            ORDER BY data_entrada ASC
        `, [id_user]);

        const periodDates = result.rows.map(r => formatDate(r.data_entrada));

        const cycleStats = await client.query(`
            SELECT
                AVG(ciclo) AS media
            FROM (
                     SELECT
                         data_entrada - LAG(data_entrada) OVER (ORDER BY data_entrada) AS ciclo
                     FROM menstrual_diary
                     WHERE id_user = $1 AND menses_status = 'Bleeding'
                 ) sub
            WHERE ciclo IS NOT NULL
        `, [id_user]);

        const averageCycle = parseInt(cycleStats.rows[0].media) || 28;

        const lastBleedingDateStr = periodDates[periodDates.length - 1];
        const lastBleedingDate = new Date(lastBleedingDateStr);

        const predictedPeriod = new Date(lastBleedingDate);
        predictedPeriod.setDate(predictedPeriod.getDate() + averageCycle);
        const nextPredictedPeriod = formatDate(predictedPeriod);

        const ovulation = new Date(predictedPeriod);
        ovulation.setDate(ovulation.getDate() - 14);
        const ovulationDate = formatDate(ovulation);

        const fertileStart = new Date(ovulation);
        fertileStart.setDate(fertileStart.getDate() - 4);
        const fertileEnd = new Date(ovulation);
        fertileEnd.setDate(fertileEnd.getDate() + 1);

        const follicularStart = new Date(lastBleedingDate);
        const follicularEnd = new Date(ovulation);
        follicularEnd.setDate(follicularEnd.getDate() - 1);

        const lutealStart = new Date(ovulation);
        lutealStart.setDate(lutealStart.getDate() + 1);

        const lutealEnd = new Date(predictedPeriod);
        lutealEnd.setDate(lutealEnd.getDate() - 1);

        const today = new Date();
        const todayStr = formatDate(today);

        let alert = "";

        const daysDiff = (targetDate) => {
            const d = new Date(targetDate);
            const diffTime = d - today;
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };

        const isBetween = (target, start, end) => {
            const d = new Date(target);
            return d >= new Date(start) && d <= new Date(end);
        };

        if (isBetween(todayStr, formatDate(fertileStart), formatDate(fertileEnd))) {
            alert = "Está no período fértil. É possível sentir aumento da libido, sensibilidade nos seios ou mudanças no humor.";
        } else if (todayStr === ovulationDate) {
            alert = "Hoje é o dia estimado da ovulação. Pode sentir aumento da temperatura corporal, aumento da libido ou muco cervical elástico.";
        } else if (todayStr === nextPredictedPeriod) {
            alert = "Hoje pode marcar o início do próximo período. Sintomas comuns incluem cólicas, irritabilidade e fadiga.";
        } else {
            const daysToOvulation = daysDiff(ovulationDate);
            const daysToPeriod = daysDiff(nextPredictedPeriod);

            if (daysToOvulation > 0 && daysToOvulation <= 5) {
                alert = `A ovulação aproxima-se. Faltam ${daysToOvulation} dia(s). Fertilidade a aumentar.`;
            } else if (daysToPeriod > 0 && daysToPeriod <= 5) {
                alert = `A menstruação aproxima-se. Faltam ${daysToPeriod} dia(s). Pode sentir sintomas pré-menstruais.`;
            }
        }

        res.json({
            periodDates,
            nextPredictedPeriod,
            ovulationDate,
            follicularStart: formatDate(follicularStart),
            follicularEnd: formatDate(follicularEnd),
            lutealStart: formatDate(lutealStart),
            lutealEnd: formatDate(lutealEnd),
            fertileStart: formatDate(fertileStart),
            fertileEnd: formatDate(fertileEnd),
            alertMessage: alert
        });
    } catch (err) {
        console.error("Erro ao obter dados do calendário:", err);
        res.status(500).json({ error: "Erro interno do servidor." });
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