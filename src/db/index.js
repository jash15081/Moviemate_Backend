import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

dotenv.config({
    path: './.env'
});

// Use the MONGO_URI from the environment variables or fallback to a hardcoded string (for testing)
// const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://chintan:chintan123@cluster0.i5cai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const MONGO_URI = "mongodb+srv://chintan:chintan123@cluster0.i5cai.mongodb.net";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log(`MongoDB connected..!!! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection is FAILED..!!! ", error);
        console.log(process.env.MONGODB_URI);
        console.log(DB_NAME)
        process.exit(1)
    }
}

export default connectDB