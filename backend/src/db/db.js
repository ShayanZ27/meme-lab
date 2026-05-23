const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connStr = 'mongodb://shayanz619_db_user:oISvVkBYQhr2RV1C@ac-xtq7rye-shard-00-00.s9jh7ng.mongodb.net:27017,ac-xtq7rye-shard-00-01.s9jh7ng.mongodb.net:27017,ac-xtq7rye-shard-00-02.s9jh7ng.mongodb.net:27017/blah-blah?ssl=true&replicaSet=atlas-ofse09-shard-0&authSource=admin&retryWrites=true&w=majority';
        console.log(`Connecting to MongoDB...`);
        const conn = await mongoose.connect(connStr);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        console.warn('Proceeding without a database connection. Some features may not work.');
    }
};

module.exports = connectDB;
