import { Router } from "express";
import {
  getRoomsByUserId,
  getRoomById,
  updateRoom,
  insertRoom,
  deleteRoom,
  getPlantsByRoomId,
} from "../db/dataAccess.js";
import { mapPlantRow } from "../services/mappers.js";
import { authenticateToken } from "../middleware/auth.js";

export const endpointsAmbientes = Router();

endpointsAmbientes.use(authenticateToken);

function mapRoom(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    temperatureLevel: row.temperature_level,
    humidityLevel: row.humidity_level,
    lightLevel: row.light_level,
    isIndoors: row.is_indoors,
  };
}

endpointsAmbientes.get("/", async (req, res) => {
  const userId = req.user.userId;

  try {
    const rows = await getRoomsByUserId(userId);
    res.json(rows.map(mapRoom));
  } catch (error) {
    console.error("Error en get-rooms:", error);
    res.sendStatus(500);
  }
});

endpointsAmbientes.put("/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const { name, isIndoors, temperatureLevel, humidityLevel, lightLevel } = req.body;

  try {
    const existingRoom = await getRoomById(roomId);
    if (!existingRoom || Number(existingRoom.user_id) !== Number(req.user.userId)) {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }

    const updatedRoom = await updateRoom(
      roomId,
      name,
      isIndoors,
      temperatureLevel,
      humidityLevel,
      lightLevel
    );

    if (!updatedRoom) {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }

    res.json({
      message: "Habitación actualizada correctamente",
      room: mapRoom(updatedRoom),
    });
  } catch (error) {
    console.error("Error en edit-room:", error);
    res.sendStatus(500);
  }
});

endpointsAmbientes.get("/:roomId/plants", async (req, res) => {
  const { roomId } = req.params;

  try {
    const existingRoom = await getRoomById(roomId);
    if (!existingRoom || Number(existingRoom.user_id) !== Number(req.user.userId)) {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }

    const rows = await getPlantsByRoomId(roomId);
    res.json(rows.map(mapPlantRow));
  } catch (error) {
    console.error("Error en get-plants-by-room-id:", error);
    res.sendStatus(500);
  }
});

endpointsAmbientes.post("/", async (req, res) => {
  const { name, isIndoors, temperatureLevel, humidityLevel, lightLevel } = req.body;
  const userId = req.user.userId;

  if (!name || isIndoors === undefined || temperatureLevel === undefined) {
    return res.status(400).json({
      error: "Faltan campos requeridos (name, isIndoors, temperatureLevel)",
    });
  }

  try {
    const newRoom = await insertRoom(
      Number(userId),
      name,
      isIndoors,
      temperatureLevel,
      humidityLevel ?? null,
      lightLevel ?? null
    );
    res.status(201).json({
      message: "Habitación creada correctamente",
      room: mapRoom(newRoom),
    });
  } catch (error) {
    console.error("Error en create-room:", error);
    res.sendStatus(500);
  }
});

endpointsAmbientes.delete("/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const existingRoom = await getRoomById(roomId);
    if (!existingRoom || Number(existingRoom.user_id) !== Number(req.user.userId)) {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }

    const deletedRoom = await deleteRoom(roomId);
    if (!deletedRoom) {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }
    res.json({
      message: "Habitación eliminada correctamente",
      roomId: deletedRoom.id,
    });
  } catch (error) {
    console.error("Error en delete-room:", error);
    res.sendStatus(500);
  }
});
