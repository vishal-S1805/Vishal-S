const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = 3000;
const JWT_SECRET = 'day17_secret_key';

// Middleware
app.use(express.json());
app.use(cors());

// --- MongoDB Connection ---
mongoose.connect('mongodb://127.0.0.1:27017/day17_july2026_db')
    .then(() => console.log('🔌 SUCCESS: Connected to MongoDB!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- User Schema & Model ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// --- Day 17 Task: Search User Functionality ---
app.get('/users/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.json([]);
        // Case-insensitive name search using regex
        const users = await User.find({ name: { $regex: name, $options: 'i' } }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Auth Route: Signup ---
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) return res.status(400).json({ message: "Email already registered." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email: email.toLowerCase().trim(), password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Signup successful!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Auth Route: Login ---
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials." });
        }
        
        // Generate Token
        const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Login successful!", token, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Server Initialization
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));