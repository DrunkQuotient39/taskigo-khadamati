const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MongoDB connection string from environment or fallback to local
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskego';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;