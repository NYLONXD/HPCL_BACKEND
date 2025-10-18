require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const vendorRoutes = require('./routes/vendor.routes');
const locationRoutes = require('./routes/location.routes');
const dealerRouter = require('./routes/dealer.routes');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Updated auth route prefix
app.use('/api/auth', authRoutes);

// Other routes remain the same
app.use('/location', locationRoutes);
app.use('/api/vendor', vendorRoutes);
app.use("/api/dealer", dealerRouter);

// Root endpoint
app.get('/', (req, res) => res.send('Vendor Module API'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
