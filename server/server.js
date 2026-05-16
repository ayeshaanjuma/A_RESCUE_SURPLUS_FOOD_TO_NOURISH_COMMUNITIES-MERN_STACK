const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./db');

dotenv.config();

// Connect to Database and start server
const startServer = async () => {
    try {
        await connectDB();

        const app = express();

        // Middleware
        app.use(cors());
        app.use(express.json());

        // Create uploads folder if not exists
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        // Serve static files from uploads folder
        app.use('/uploads', express.static(uploadDir));

        // Rate Limiting
        const limiter = rateLimit({
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 1000, // limit each IP to 1000 requests per minute
            message: 'Too many requests from this IP, please try again later.'
        });
        app.use('/api', limiter);

        // Routes Setup
        app.use('/api/auth', require('./routes/authRoutes'));
        app.use('/api/donations', require('./routes/donationRoutes'));
        app.use('/api/upload', require('./routes/uploadRoutes'));
        app.use('/api/users', require('./routes/userRoutes'));
        app.use('/api/geocoding', require('./routes/geocodingRoutes'));
        app.use('/api/feedback', require('./routes/feedbackRoutes'));
        // app.use('/api/admin', require('./routes/adminRoutes'));

        // Root Endpoint
        app.get('/', (req, res) => {
            res.send('Food Rescue & Redistribution API is running...');
        });

        // Error Handling Middleware
        app.use((err, req, res, next) => {
            const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
            res.status(statusCode);
            res.json({
                message: err.message,
                stack: process.env.NODE_ENV === 'production' ? null : err.stack,
            });
        });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
