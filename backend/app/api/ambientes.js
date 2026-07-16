// ambientes.js
import { Router } from "express";
import { getRoomsByUserId, updateRoom } from "../db/rooms.js";

export const endpointsAmbientes = Router();

// get-rooms(userId): devuelve ambientes del usuario
endpointsAmbientes.get("/", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing required parameter: userId" });
  }

  try {
    const rows = await getRoomsByUserId(userId);

    const rooms = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      imageUrl: row.image_url,
      temperatureLevel: row.temperature_level,
      isIndoors: row.is_indoors
    }));

    res.json(rooms);

  } catch (error) {
    console.error("Error en get-rooms:", error);
    res.sendStatus(500);
  }
});

// edit-room(roomId, {campos modificados})
endpointsAmbientes.put("/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const { name, isIndoors } = req.body;

  try {
    const updatedRoom = await updateRoom(roomId, name, isIndoors);

    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      message: "Room updated successfully",
      room: {
        id: updatedRoom.id,
        userId: updatedRoom.user_id,
        name: updatedRoom.name,
        imageUrl: updatedRoom.image_url,
        temperatureLevel: updatedRoom.temperature_level,
        isIndoors: updatedRoom.is_indoors
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
