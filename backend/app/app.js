// app.js
import express from "express";
import { endpointsPlantas } from "./api/plantas.js";
import { endpointsAuth } from "./api/auth.js";

const app = express();
const port = 8000;

app.use(express.json());
app.use("/api/v1/plantas", endpointsPlantas);
app.use("/api/v1/auth", endpointsAuth);

app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});