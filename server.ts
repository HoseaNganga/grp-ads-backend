import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDB } from "./utils/connectDb";
import authRoutes from "./routes/auth.route";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`🌐 ${req.method} ${req.originalUrl}`);
  next();
});
app.use("/api/auth", authRoutes);

app.get("/ping", (_req, res) => {
  res.send("pong");
});

const PORT = process.env.PORT || 5050;

connectToDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
});
