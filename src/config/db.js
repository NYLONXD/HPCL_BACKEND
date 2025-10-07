const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/HPCL_Vendor';
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Mongo connect error', err);
    process.exit(1);
  }
};
