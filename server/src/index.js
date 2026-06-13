require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const executionRoutes = require('./routes/executionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Public Health Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Mount Routes
app.use('/api/users', userRoutes);
app.use('/api/execute', executionRoutes);
app.use('/api', interviewRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
