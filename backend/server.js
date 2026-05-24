require('dotenv').config();
require('dns').setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { keyPairFromSeed } = require('./eddsa'); 

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
const path = require('path');
const { Pool } = require('pg');

// Create a connection specifically for the init script with Render's SSL requirement
const initPool = new Pool({
    ssl: process.env.PGHOST !== 'localhost' ? { rejectUnauthorized: false } : false
});

try {
    // path.join(__dirname) ensures Render doesn't get lost looking for the file
    const sqlPath = path.join(__dirname, 'db-init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    initPool.query(sql)
        .then(() => console.log('✅ Cloud Database Tables Created Successfully!'))
        .catch(err => console.log('⚠️ DB Init Notice (Tables might already exist):', err.message));
} catch (err) {
    console.error('❌ Failed to read db-init.sql:', err.message);
}
// -----------------------------------------------------

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));