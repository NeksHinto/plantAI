const provider = process.env.DB_PROVIDER === "supabase" ? "supabase" : "local";

const users = await import(`./${provider}/users.js`);
const rooms = await import(`./${provider}/rooms.js`);
const plants = await import(`./${provider}/plants.js`);

export const getUserByUsername = users.getUserByUsername;

export const getRoomsByUserId = rooms.getRoomsByUserId;
export const getRoomById = rooms.getRoomById;
export const insertRoom = rooms.insertRoom;
export const updateRoom = rooms.updateRoom;
export const deleteRoom = rooms.deleteRoom;

export const getPlantsByRoomId = plants.getPlantsByRoomId;
export const getPlantById = plants.getPlantById;
export const getHealthRecordsByPlantId = plants.getHealthRecordsByPlantId;
export const updatePlant = plants.updatePlant;
export const insertPlant = plants.insertPlant;
export const insertHealthRecord = plants.insertHealthRecord;
export const getRoomContextByPlantId = plants.getRoomContextByPlantId;
export const deletePlant = plants.deletePlant;
export const deleteHealthRecord = plants.deleteHealthRecord;
export const updateHealthRecord = plants.updateHealthRecord;
