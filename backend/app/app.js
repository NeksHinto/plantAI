import express from "express";
import cors from "cors";
import { endpointsPlantas } from "./api/plants.js";
import { endpointsAuth } from "./api/auth.js";
import { endpointsAmbientes } from "./api/rooms.js";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use("/api/v1/plantas", endpointsPlantas);
app.use("/api/v1/auth", endpointsAuth);
app.use("/api/v1/rooms", endpointsAmbientes);

app.get("/health", (req, res) => res.send("OK"));

app.listen(8000, () => {
  console.log("Server running at http://localhost:8000/");
});
