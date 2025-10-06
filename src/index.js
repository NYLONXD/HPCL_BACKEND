require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const locationRoutes = require('./routes/location');
const dealerRouter = require('./routes/dealer.routes');
// const seedRoutes = require('./routes/seed');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/jobs', jobsRoutes);
app.use('/location', locationRoutes);
app.use("/api/dealer", dealerRouter);

// app.use('/seed', seedRoutes);

app.get('/', (req, res) => res.send('Vendor Module API'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
