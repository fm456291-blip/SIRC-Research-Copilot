const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Local SQLite Database File Setup (Ye project folder me khud hi 'sirc_local.db' file bana dega)
const db = new sqlite3.Database('./sirc_local.db', (err) => {
    if (err) {
        console.error('Database opening error: ', err.message);
    } else {
        console.log('Connected to local SQLite database.');
    }
});

// Tables Create Karna (Agar pehle se nahi hain)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        query TEXT,
        response TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);
});

// --- API Endpoints ---

// 1. Signup Endpoint
app.post('/api/signup', (async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.json({ success: true, userId: this.lastID, message: 'User registered successfully' });
    });
}));

// 2. Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

        res.json({ success: true, userId: user.id, username: user.username, message: 'Login successful' });
    });
});

// 3. Save History Endpoint
app.post('/api/history', (req, res) => {
    const { userId, query, response } = req.body;
    
    db.run(`INSERT INTO history (userId, query, response) VALUES (?, ?, ?)`, [userId, query, response], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save history' });
        res.json({ success: true });
    });
});

// 4. Get User History Endpoint
app.get('/api/history/:userId', (req, res) => {
    const userId = req.params.userId;
    
    db.all(`SELECT * FROM history WHERE userId = ? ORDER BY timestamp DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch history' });
        res.json(rows);
    });
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});