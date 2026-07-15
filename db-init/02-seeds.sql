INSERT INTO Users (name, email, password_hash) 
VALUES 
('Jesus Meza Caya', 'jesus@plantai.com', 'hasheado123'), 
('Nicole Renée', 'nicole@plantai.com', 'hasheado456'),
('Dylan Rivas', 'dylan@plantai.com', 'hasheado789');

INSERT INTO Rooms (userId, name, isIndoors, sunlight_type, temperature_avg) 
VALUES 
(1, 'Living', TRUE, 'indirecta', 22.5), 
(1, 'Balcón', FALSE, 'directa', 28.0),
(3, 'Dormitorio', TRUE, 'sombra', 20.0);