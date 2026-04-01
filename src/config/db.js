import mongoose from "mongoose";
import env from './env.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.mongoUri);
        console.log(`MongoDB conectado em ${conn.connection.host}:${conn.connection.port}`)
    } catch (error) {
        console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;