const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = 3000;

// 1. Create a Connection Pool based on your DBConfig
// This is more efficient than creating a new connection for every request
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10, // Adjusted to a safer limit for most free-tier DBs
    queueLimit: 0,
});

app.use(express.json());

// Example Route: Get all cards
app.get('/allcards', async (req, res) => {
    try {
        // Use pool.query instead of creating a connection
        const [rows] = await pool.query('SELECT * FROM cards');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error for allcards' });
    }
});

// Example Route: Create a new Card
app.post('/addcard', async (req, res) => {
    const { card_name, card_pic } = req.body;
    try {
        await pool.execute('INSERT INTO cards (card_name, card_pic) VALUES (?, ?)', [card_name, card_pic]);
        res.status(201).json({ message: `Card ${card_name} added successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not add card' });
    }
});

// Example Route: Editing a card
app.put('/editcard/:id', async (req, res) => {
    const { id } = req.params;
    const { card_name, card_pic } = req.body;
    try {
        // Changed from connection.execute to pool.execute
        const [result] = await pool.execute(
            'UPDATE cards SET card_name = ?, card_pic = ? WHERE id = ?',
            [card_name, card_pic, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Card with id ${id} not found` });
        }
        res.json({ message: `Card ${id} updated successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during update' });
    }
});

// Example Route: Deleting a card
app.delete('/deletecard/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.execute('DELETE FROM cards WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Card with id ${id} not found` });
        }
        res.json({ message: `Card ${id} deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during deletion' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});