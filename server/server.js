import express from "express";
import cors from "cors";

import connectDB from "./db/connectDB.js";
import recordRoutes from "./routes/record.route.js";
import authRoutes from "./routes/auth.route.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(
  cors({
    origin: [
      "https://of-client-c901ce91e892.herokuapp.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use(express.json()); // for parsing incoming JSON requests: req.body

app.use("/record", recordRoutes);
app.use("/auth", authRoutes);

// start the Express server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server listening on port ${PORT}`);
});
