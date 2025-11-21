import fs from 'fs';
import https from 'https';
import express from 'express';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import billRoutes from './routes/billRoutes.js';
import billsDataRoutes from "./routes/billsDataRoutes.js";
// import filterRoutes from "./routes/filterRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", express.static("uploads"));
app.use("/", authRoutes); 
app.use("/", billRoutes);
app.use("/", billsDataRoutes);
// app.use("/", filterRoutes);

app.get("/test", (req, res) => {
  res.send("Backend is working!");
});


const sslOptions = {
  key: fs.readFileSync('/home/xsendwork/conf/web/xsendwork.com/ssl/xsendwork.com.key'),
  cert: fs.readFileSync('/home/xsendwork/conf/web/xsendwork.com/ssl/xsendwork.com.crt'),
  ca: fs.readFileSync('/home/xsendwork/conf/web/xsendwork.com/ssl/xsendwork.com.ca')
};

const PORT = process.env.PORT || 8001;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`🚀 Server running on https://localhost:${PORT}`);
});


// server.js
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import billRoutes from "./routes/billRoutes.js";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));
// app.use("/", billRoutes);

// const PORT = process.env.PORT || 8001;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
