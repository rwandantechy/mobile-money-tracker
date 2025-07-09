require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const earningsRouter = require('./routes/earnings');
const authRouter = require('./routes/auth');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 6000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Public routes (no auth required)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

// Protected routes (auth required)
app.get('/app', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/app.html'));
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/earnings', auth, earningsRouter);

// MongoDB Connection with Atlas
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority',
    dbName: 'mydata'
})
.then(() => {
    console.log('Connected to MongoDB Atlas');
    // Start server only after successful database connection
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('MongoDB Atlas connection error:', err);
    process.exit(1); // Exit if cannot connect to database
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Don't exit the process in production
    if (process.env.NODE_ENV === 'production') {
        console.log('Continuing in production mode...');
    } else {
        process.exit(1);
    }
}); 