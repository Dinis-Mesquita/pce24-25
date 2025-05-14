//bibliotecas
// npm install express pg cors dotenv axios express-validator
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


/*

// Route to register a new user
app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }

    try {
        const client = await pool.connect();

        // Check if user already exists
        const existingUser = await client.query("SELECT * FROM user WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            client.release();
            return res.status(400).json({ error: "Email is already in use" });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user
        const result = await client.query(
            `INSERT INTO user (nome, email, password)
             VALUES ($1, $2, $3) RETURNING user_id;`,
            [name, email, hashedPassword]
        );

        client.release();
        res.json({ message: "User registered successfully", user_id: result.rows[0].user_id });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to register user" });
    }
});


const jwt = require("jsonwebtoken");

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const client = await pool.connect();

        // Find user by email
        const userResult = await client.query("SELECT * FROM user WHERE email = $1", [email]);
        client.release();

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = userResult.rows[0];

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

*/



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