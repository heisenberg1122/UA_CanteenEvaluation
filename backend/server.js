require('dotenv').config();
require('dns').setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { keyPairFromSeed } = require('./eddsa'); // Kept from your original code

const app = express();

// Set up CORS - Strictly allow only your frontend URLs
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'https://ua-canteen-evaluation.vercel.app',
        'https://ua-canteen-web.onrender.com' // <--- Your Render Frontend
    ],
    credentials: true
}));

// CRITICAL FIX: Allow the server to accept large Base64 photos without crashing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api', routes);

// --- AUTO DB INITIALIZATION (FOR RENDER FREE TIER) ---
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool();
try {
    const sql = fs.readFileSync('./db-init.sql', 'utf8');
    pool.query(sql)
        .then(() => console.log('✅ Cloud Database Tables Created Successfully!'))
        .catch(err => console.log('⚠️ DB Init Notice (Tables might already exist):', err.message));
} catch (err) {
    console.error('Failed to read db-init.sql', err);
}
// -----------------------------------------------------

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));