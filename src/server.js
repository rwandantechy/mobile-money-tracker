require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const earningsRouter = require('./routes/earnings');
const authRouter = require('./routes/auth');
const auth = require('./middleware/auth');
const webAuth = require('./middleware/webAuth');

const app = express();
const PORT = process.env.PORT || 6000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins for easy deployment
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

// Additional middleware for deployment
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security headers for deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint for deployment
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Money Tracker Pro API is running',
        timestamp: new Date().toISOString()
    });
});

// Public routes (no auth required)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/register.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/password-reset.html'));
});

// Protected routes (auth required)
app.get('/app', webAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/dashboard.html'));
});

app.get('/dashboard', webAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/dashboard.html'));
});

app.get('/profile', webAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/profile.html'));
});

app.get('/settings', webAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/settings.html'));
});

// Additional routes for other pages
app.get('/otp-verification', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/otp-verification.html'));
});

app.get('/password-reset', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/password-reset.html'));
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/reset-password.html'));
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/earnings', auth, earningsRouter);

// 404 handler for deployment
app.use('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint not found' });
    } else {
        res.sendFile(path.join(__dirname, '../public/pages/index.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

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