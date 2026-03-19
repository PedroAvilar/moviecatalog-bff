import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/moviecatalog';

        const conn = await mongoose.connect(mongoURI);

        console.log(`MongoDB Conectado: ${conn.connect.name}`)
    } catch (error) {
        console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;