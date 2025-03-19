//bibliotecas
// npm install express pg cors dotenv axios express-validator
// npm install --save-dev nodemon


require('dotenv').config(); //Carregar variáveis de ambiente do arquivo .env para process.env

const express = require('express'); //Importar o Express (framework para criar servidores web e APIs)
const { Pool } = require('pg'); //Importar o pg (cliente PostgreSQL para Node.js)
const axios = require('axios'); // Importar Axios (cliente HTTP para requisições externas)


const cors = require('cors'); // Importar o CORS (permite requisições entre diferentes domínios)  //vamos usar?
const { body, validationResult } = require('express-validator'); // Importar Express Validator (validação e sanitização de dados)


const app = express(); // framework para Node.js usado para criar servidores web e APIs
const port = process.env.PORT || 3000;

// Configuração do PostgreSQL
const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
});



// Iniciar o servidor com nodemon (o servidor reinicia automaticamente ao fazer alterações)
app.listen(port, () => {
    console.log(`Servidor a correr em http://localhost:${port}`);
});