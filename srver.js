const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = 3000;
const JWT_SECRET = 'day17_secret_key';

app.use(express.json());
app.use(cors());

// --- Database Connection ---
mongoose.connect('mongodb://127.0.0.1:27017/day17_db')
    .then(() => console.log('🔌 Success: Connected to MongoDB database.'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- User Schema ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// --- Task: Search Endpoint ---
app.get('/users/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.json([]);
        const users = await User.find({ name: { $regex: name, $options: 'i' } }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Auth Routes ---
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

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials." });
        }
        const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Login successful!", token, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




const mongoose = require('mongoose');

// The connection string linking Node.js to your local MongoDB engine
mongoose.connect('mongodb://127.0.0.1:27017/day17_final_db')
    .then(() => {
        console.log('------------------------------------------------');
        console.log('🔌 Success: Node.js is now connected to MongoDB!');
        console.log('------------------------------------------------');
    })
    .catch((error) => {
        console.error('❌ Database connection failed:', error.message);
    });