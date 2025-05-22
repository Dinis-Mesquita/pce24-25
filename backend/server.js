//bibliotecas
// npm install express pg cors dotenv axios express-validator jsonwebtoken
// npm install --save-dev nodemon


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
        // Check if email exists
        const check = await client.query(`SELECT * FROM "user" WHERE email = $1`, [email]);
        if (check.rows.length > 0) {
            return res.status(409).json({ message: "Email já registrado." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await client.query(
            `INSERT INTO "user" (email, password) VALUES ($1, $2) RETURNING id_user`,
            [email, hashedPassword]
        );

        res.status(201).json({ message: "Usuário registrado com sucesso!", id_user: result.rows[0].id_user });
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

app.post('/api/test', (req, res) => {
    console.log("Received body:", req.body);
    res.json({ received: req.body });
});
app.listen(port, () => {
    console.log(`Servidor a correr em http://localhost:${port}`);
});