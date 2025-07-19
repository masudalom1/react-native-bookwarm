import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/User.js"
import cookieParser from "cookie-parser";
import booksRouter from "./routes/Book.js"
import cors from "cors"

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

const ConnectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("DB connected.")
    } catch (error) {
        throw error;
    }
}

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books",booksRouter)

app.listen(PORT, () => {
  console.log("Server is running.");
  ConnectDB();
});
