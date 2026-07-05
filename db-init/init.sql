DROP TABLE IF EXISTS PlantHealthRecord CASCADE;
DROP TABLE IF EXISTS Plants CASCADE;
DROP TABLE IF EXISTS Rooms CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    creationDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE Rooms (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    isIndoors BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Plants (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    roomId INT REFERENCES Rooms(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(100),
    species VARCHAR(100),
    identify_data JSONB
);

CREATE TABLE PlantHealthRecord (
    id SERIAL PRIMARY KEY,
    plantId INT NOT NULL REFERENCES Plants(id) ON DELETE CASCADE,
    diseases_data JSONB NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_rooms_user_id ON Rooms(userId);
CREATE INDEX idx_plants_room_id ON Plants(roomId);
CREATE INDEX idx_plants_user_id ON Plants(userId);
CREATE INDEX idx_health_plant_id ON PlantHealthRecord(plantId);

INSERT INTO Users (name) VALUES ('Jesus Meza Caya'), ('Nicole Renée');
INSERT INTO Rooms (userId, name, isIndoors) VALUES (1, 'Living', TRUE), (1, 'Balcón', FALSE);