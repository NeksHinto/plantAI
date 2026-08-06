-- USUARIOS--
INSERT INTO users (name, username, password) 
VALUES 
    ('Jesus Meza Caya', 'jesus', '1234'), 
    ('Nicole Renée', 'nicole', '1234'),
    ('Dylan Rivas', 'dylan', '1234'), 
    ('Agustin Mazurkiewich', 'agustin', '1234');


--HABITACIONES (independientes por usuario)
INSERT INTO rooms (user_id, name, is_indoors, temperature_level, humidity_level, light_level) 
VALUES 
    -- Jesús (id: 1) solo tiene un Balcón
    (1, 'Balcón', FALSE, 28, 'baja', 'alta'),
    
    -- Nicole (id: 2) armó su espacio en el Dormitorio
    (2, 'Dormitorio', TRUE, 20, 'media', 'baja'),
    
    -- Dylan (id: 3) tiene dos habitaciones: Living y Balcón
    (3, 'Living', TRUE, 22, 'media', 'media'),
    (3, 'Balcón', FALSE, 28, 'baja', 'alta'),
    
    -- Agustín (id: 4) solo tiene un Living
    (4, 'Living', TRUE, 22, 'media', 'media');


--PLANTAS (image_url se completa al subir a Storage; seed deja null / opcionales)
INSERT INTO plants (user_id, room_id, name, common_name, species, image_url)
VALUES
    (1, 1, 'Malvón rojo', 'Malvón', 'Pelargonium x hortorum', NULL),
    (2, 2, 'Lazo', 'Lazo de amor', 'Chlorophytum comosum', NULL),
    (3, 3, 'El Güembé', 'Güembé', 'Philodendron bipinnatifidum', NULL),
    (3, 4, 'Jazmín', 'Jazmín del país', 'Jasminum officinale', NULL),
    (4, 5, 'Serrucho', 'Helecho Serrucho', 'Nephrolepis cordifolia', NULL);


--DIAGNÓSTICOS --
INSERT INTO plant_health_records (plant_id, diagnosis, accuracy, treatment_notes, image_url, created_at)
VALUES
    (1, 'no disease', 99.99, 'Buen estado general. Asegúrate de no regar en exceso.', NULL, '2025-01-10 10:30:00-03'),
    (2, 'no disease', 95.00, 'La planta está en perfectas condiciones de salud.', NULL, '2025-01-15 14:15:00-03'),
    (3, 'spider_mites', 89.50, 'Aislar la planta. Aplicar aceite de neem o jabón potásico sobre las hojas afectadas cada 7 días.', NULL, '2025-01-20 09:00:00-03'),
    (4, 'no disease', 99.00, 'Buen estado general.', NULL, '2025-01-22 16:45:00-03'),
    (5, 'no disease', 98.50, 'La planta está en perfectas condiciones de salud.', NULL, '2025-01-25 11:20:00-03');
