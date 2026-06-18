import express from "express";
import { endpointsPlantas } from "./api/plantas.js";

const app = express();
const port = 8000;

app.use(express.json());
app.use("/api/v1/plantas", endpointsPlantas);

app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});