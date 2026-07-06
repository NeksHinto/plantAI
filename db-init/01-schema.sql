DROP TABLE IF EXISTS PlantHealthRecord CASCADE;
DROP TABLE IF EXISTS Plants CASCADE;
DROP TABLE IF EXISTS Rooms CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    creationDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE Rooms (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    isIndoors BOOLEAN NOT NULL DEFAULT TRUE,
    sunlight_type VARCHAR(50), 
    temperature_avg DECIMAL(5,2),
    notes TEXT
);

CREATE TABLE Plants (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    roomId INT REFERENCES Rooms(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(100),
    species VARCHAR(100),
    water_frequency_days INT,
    identify_data JSONB
);

CREATE TABLE PlantHealthRecord (
    id SERIAL PRIMARY KEY,
    plantId INT NOT NULL REFERENCES Plants(id) ON DELETE CASCADE,
    diseases_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'en evaluación',
    treatment_notes TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_rooms_user_id ON Rooms(userId);
CREATE INDEX idx_plants_room_id ON Plants(roomId);
CREATE INDEX idx_plants_user_id ON Plants(userId);
CREATE INDEX idx_health_plant_id ON PlantHealthRecord(plantId);