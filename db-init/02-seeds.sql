INSERT INTO users (name, username, password) 
VALUES 
('Jesus Meza Caya', 'jesus@plantai.com', 'hasheado123'), 
('Nicole Renée', 'nicole@plantai.com', 'hasheado456'),
('Dylan Rivas', 'dylan@plantai.com', 'hasheado789');

INSERT INTO rooms (user_id, name, is_indoors, temperature_level) 
VALUES 
(3, 'Living', TRUE, '22.5°C'), 
(3, 'Balcón', FALSE, '28.0°C'),
(3, 'Dormitorio', TRUE, '20.0°C');

INSERT INTO plants (user_id, room_id, name, species, image_url)
VALUES
(3, 1, 'Mi Helecho', 'Monstera deliciosa', 'dummy image'),
(3, 2, 'Cactus balcón', 'Cactaceae', 'dummy image');

INSERT INTO plant_health_records (plant_id, diagnosis, accuracy, treatment_notes)
VALUES
(1, 'no disease', 100.00, 'La planta está en perfectas condiciones.'),
(2, 'no disease', 100.00, 'Buen estado general.');