// ambientes.js
import { Router } from "express";
import {
  getRoomsByUserId,
  updateRoom,
  insertRoom,
  deleteRoom,
  getPlantsByRoomId,
} from "../db/dataAccess.js";
import { mapPlantRow } from "../services/mappers.js";

export const endpointsAmbientes = Router();

// get-rooms(userId): devuelve ambientes del usuario
endpointsAmbientes.get("/", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Falta el parametro requerido: userId" });
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
      return res.status(404).json({ error: "Habitación no encontrada" });
    }

    res.json({
      message: "Habitación actualizada correctamente",
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
    const rows = await getPlantsByRoomId(roomId);
    const plants = rows.map(mapPlantRow);
    res.json(plants);

  } catch (error) {
    console.error("Error en get-plants-by-room-id:", error);
    res.sendStatus(500);
  }
});

// create-room(userId, name, isIndoors)
endpointsAmbientes.post("/", async (req, res) => {
  const { userId, name, isIndoors, temperatureLevel } = req.body;

  if (!userId || !name || isIndoors === undefined || temperatureLevel === undefined) {
    return res.status(400).json({ error: "Faltan campos requeridos (userId, name, isIndoors, temperatureLevel)" });
  }

  try {
    const newRoom = await insertRoom(Number(userId), name, isIndoors, temperatureLevel);
    res.status(201).json({
      message: "Habitación creada correctamente",
      room: {
        id: newRoom.id,
        userId: newRoom.user_id,
        name: newRoom.name,
        imageUrl: newRoom.image_url,
        temperatureLevel: newRoom.temperature_level,
        isIndoors: newRoom.is_indoors
      }
    });
  } catch (error) {
    console.error("Error en create-room:", error);
    res.sendStatus(500);
  }
});

// delete-room(roomId)
endpointsAmbientes.delete("/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const deletedRoom = await deleteRoom(roomId);
    if (!deletedRoom) {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }
    res.json({
      message: "Habitación eliminada correctamente",
      roomId: deletedRoom.id
    });
  } catch (error) {
    console.error("Error en delete-room:", error);
    res.sendStatus(500);
  }
});
