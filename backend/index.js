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

const app = express(); // framework para Node.js usado para criar servidores web e APIs
const port = process.env.PORT || 3000;

// Configuração do PostgreSQL
const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
});

// Middleware para permitir JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// da parse do json


app.post("/api/compositions", async (req, res) => {
    let { composition } = req.body;
    if (typeof composition === "string") {
        composition = JSON.parse(composition);
    }

    const id = uuidv4();

    try {
        await pool.query(
            "INSERT INTO public.composition VALUES ($1, $2)",
            [id, composition]
        );
        res.status(201).json({ message: "Guardado com sucesso!", id });
    } catch (err) {
        console.error("Erro ao guardar:", err);
        res.status(500).json({ error: "Erro ao guardar a composition" });
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





// Route to receive menstrual cycle data from forms // Perguntas iniciais
app.post("/api/perguntas_iniciais", async (req, res) => {
    const { id_user, dt_nascimento, peso, altura, cycle_length, typical_cycle, duration, contracetivos, problemas_saude } = req.body; //meter as variaveis 

    if (!id_user || !id_user || !dt_nascimento || !peso || !altura || !cycle_length || !typical_cycle || !duration || !contracetivos || !problemas_saude) {
        return res.status(400).json({ error: "Todos os campos sao obrigatorios!" }); //campos obrigatorios
    }

    try { //inserir na bd
        const client = await pool.connect();
        await client.query(
            `INSERT INTO menstrual_cycles (id_user, dt_nascimento, peso, altura, cycle_length, typical_cycle, duration, contracetivos, problemas_saude) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
            [user_id, dt_nascimento, peso, altura, cycle_length, typical_cycle, duration, contracetivos, problemas_saude]

        );
        client.release();
        res.json({ message: "Dados armazenados com sucesso!" });
    } catch (error) {
        console.error("Erro na db:", error);
        res.status(500).json({ error: "Erro ao processar os dados" });
    }
});
*/

//Buscar historico do utilizador
//get

// Iniciar o servidor com nodemon (o servidor reinicia automaticamente ao fazer alterações)
app.listen(port, () => {
    console.log(`Servidor a correr em http://localhost:${port}`);
});