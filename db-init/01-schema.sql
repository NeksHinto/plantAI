-- borra las tablas si ya existen para poder recrearlas de cero --
DROP TABLE IF EXISTS plant_health_records CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- tabla usuarios --
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    username VARCHAR(25) UNIQUE NOT NULL,
    password VARCHAR(25) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- tabla habitaciones --
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(25) NOT NULL,
    is_indoors BOOLEAN NOT NULL DEFAULT TRUE,
    temperature_level NUMERIC(4,1) CHECK (temperature_level BETWEEN -20 AND 50),
    humidity_level VARCHAR(20),
    light_level VARCHAR(20)
);

-- tabla plantas --
CREATE TABLE plants (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
    name VARCHAR(20) NOT NULL,
    common_name VARCHAR(50),
    species VARCHAR(50),
    image_url VARCHAR(512)
);

-- tabla registros de salud de plantas --
CREATE TABLE plant_health_records (
    id SERIAL PRIMARY KEY,
    plant_id INT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    diagnosis VARCHAR(255) NOT NULL,
    accuracy DECIMAL(5,2),
    treatment_notes TEXT,
    image_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- indices --
CREATE INDEX idx_rooms_user_id ON rooms(user_id);
CREATE INDEX idx_plants_room_id ON plants(room_id);
CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_health_plant_id ON plant_health_records(plant_id);
