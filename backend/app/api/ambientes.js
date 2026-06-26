// ambientes.js
import { Router } from "express";

export const endpointsAmbientes = Router();

// get-rooms(userId): devuelve ambientes del usuario
endpointsAmbientes.get("/", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing required parameter: userId" });
  }

  try {
    // TODO: BD, Obtener los ambientes del usuario desde la tabla "Rooms":

    // Respuesta simulada
    res.json([
      {
        id: 1,
        userId: Number(userId),
        name: "Living",
        isIndoors: true,
        lightExposure: "media"
      },
      {
        id: 2,
        userId: Number(userId),
        name: "Balcón",
        isIndoors: false,
        lightExposure: "alta"
      }
    ]);

  } catch (error) {
    console.error("Error en get-rooms:", error);
    res.sendStatus(500);
  }
});

// edit-room(roomId, {campos modificados})
endpointsAmbientes.put("/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const { name, isIndoors, lightExposure, humidityLevel } = req.body;

  try {
    // TODO: BD, Actualizar el ambiente en la tabla "Rooms":

    // Respuesta simulada
    res.json({
      message: "Room updated successfully",
      room: {
        id: Number(roomId),
        userId: 1,
        name: name || "Living",
        isIndoors: isIndoors !== undefined ? isIndoors : true,
        lightExposure: lightExposure || "media"
      }
    });

  } catch (error) {
    console.error("Error en edit-room:", error);
    res.sendStatus(500);
  }
});

// get-plants-by-room-id(roomId): devuelve listado de plantas del ambiente
endpointsAmbientes.get("/:roomId/plants", async (req, res) => {
  const { roomId } = req.params;

  try {
    // TODO: BD, Obtener listado de plantas asociadas al ambiente desde la tabla "Plants":

    // Respuesta simulada
    res.json([
      {
        id: 101,
        userId: 1,
        roomId: Number(roomId),
        name: "Mi Helecho",
        species: "Monstera deliciosa",
        species_class: "Unknown family",
        imageUrl: "dummy image",
        confidence_score: 80.1,
        commonName: "Monstera"
      }
    ]);

  } catch (error) {
    console.error("Error en get-plants-by-room-id:", error);
    res.sendStatus(500);
  }
});
