DROP TABLE IF EXISTS plant_health_records CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    temperature_level VARCHAR(50),
    is_indoors BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE plants (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(100),
    image_url VARCHAR(255)
);

CREATE TABLE plant_health_records (
    id SERIAL PRIMARY KEY,
    plant_id INT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    diagnosis VARCHAR(255) NOT NULL,
    accuracy DECIMAL(5,2),
    treatment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_rooms_user_id ON rooms(user_id);
CREATE INDEX idx_plants_room_id ON plants(room_id);
CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_health_plant_id ON plant_health_records(plant_id);