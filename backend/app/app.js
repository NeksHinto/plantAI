// app.js
import express from "express";
import cors from "cors";
import { endpointsPlantas } from "./api/plantas.js";
import { endpointsAuth } from "./api/auth.js";
import { endpointsAmbientes } from "./api/ambientes.js";

const app = express();

const corsOptions = {
  origin: '*', // Replace with domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

const port = 8000;

app.use(express.json());
app.use("/api/v1/plantas", endpointsPlantas);
app.use("/api/v1/auth", endpointsAuth);
app.use("/api/v1/rooms", endpointsAmbientes);

app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});