-- USUARIOS--
INSERT INTO users (name, username, password) 
VALUES 
    ('Jesus Meza Caya', 'jesus', '1234'), 
    ('Nicole Renée', 'nicole', '1234'),
    ('Dylan Rivas', 'dylan', '1234'), 
    ('Agustin Mazurkiewich', 'agustin', '1234');


--HABITACIONES (independientes por usuario)
INSERT INTO rooms (user_id, name, is_indoors, temperature_level, image_url) 
VALUES 
    -- Jesús (id: 1) solo tiene un Balcón
    (1, 'Balcón', FALSE, 28, 'https://images.homify.com/v1512602028/p/photo/image/2350742/DSC_0405-Editar-Editar.jpg'),
    
    -- Nicole (id: 2) armó su espacio en el Dormitorio
    (2, 'Dormitorio', TRUE, 20, 'https://img.magnific.com/fotos-premium/acogedor-dormitorio-luminoso-plantas-interiordiseno-interior-casadiseno-biofilicoconcepto-jungla-urbana_1033579-214650.jpg?semt=ais_hybrid&w=740&q=80'),
    
    -- Dylan (id: 3) tiene dos habitaciones: Living y Balcón
    (3, 'Living', TRUE, 22, 'https://cl.habcdn.com/photos/project/big/salon-con-plantas-1163533-158823.jpg'),
    (3, 'Balcón', FALSE, 28, 'https://images.homify.com/v1512602028/p/photo/image/2350742/DSC_0405-Editar-Editar.jpg'),
    
    -- Agustín (id: 4) solo tiene un Living
    (4, 'Living', TRUE, 22, 'https://cl.habcdn.com/photos/project/big/salon-con-plantas-1163533-158823.jpg');


--PLANTAS (Asignadas a los espacios de cada usuario)
INSERT INTO plants (user_id, room_id, name, common_name, species, image_url)
VALUES
    -- El cactus de Jesús en su balcón (room_id: 1)
    (1, 1, 'Malvón rojo', 'Malvón', 'Pelargonium x hortorum', 'https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcT5Xm0uES-pr6e9bKulwMDCkJ_JXlQiOUy4crhRNMsNrw_ttJmKYr--I_FkXF0hRB97d6d16HqcZnPnXhs'),
    
    -- La sansevieria de Nicole en su dormitorio (room_id: 2)
    (2, 2, 'Lazo', 'Lazo de amor', 'Chlorophytum comosum', 'https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcQIknpCryJZnCh2VZlnNG1Z1L7h_cTItYtimv-zwc6RUn1wjOJ_2_QcccapgRgkdWPTP2tJRUUPTLwYQUo'),
    
    -- La monstera de Dylan en su living (room_id: 3)
    (3, 3, 'El Güembé', 'Güembé', 'Philodendron bipinnatifidum', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSzFWD1eB2lv43emOpK0B55T5pTpK7g8HAipdvO-fIdv2dj2bNnF43IHM&s=10'),
    
    -- El cactus de Dylan en su balcón (room_id: 4)
    (3, 4, 'Jazmín', 'Jazmín del país', 'Jasminum officinale', 'https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcREFgHKKxYwHeGTGImmHcn_kqIE2dcYmK9Uhk0eaoeBaTq0LePHRAwUXrBRFToL1AuAksA75M5zTx-Ys58'),
    
    -- La monstera de Agustín en su living (room_id: 5)
    (4, 5, 'Serrucho', 'Helecho Serrucho', 'Nephrolepis cordifolia', 'https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcTWcgS4LfKq8oHDPDDvpCJqpAOz3ZhhXvaHQCzcMpVhTOciclk1GVpTYClJwJq3MPIVsLg5SFLi26yK1vI');


--DIAGNÓSTICOS --
INSERT INTO plant_health_records (plant_id, diagnosis, accuracy, treatment_notes, created_at)
VALUES
    -- Diagnóstico para 'Malvon rojo' (plant_id: 1)
    (1, 'no disease', 99.99, 'Buen estado general. Asegúrate de no regar en exceso.', '2025-01-10 10:30:00-03'),
    
    -- Diagnóstico para 'Lazo' (plant_id: 2)
    (2, 'no disease', 95.00, 'La planta está en perfectas condiciones de salud.', '2025-01-15 14:15:00-03'),
    
    -- Diagnóstico para 'El Güembé' (plant_id: 3 - Simulación de plaga)
    (3, 'spider_mites', 89.50, 'Aislar la planta. Aplicar aceite de neem o jabón potásico sobre las hojas afectadas cada 7 días.', '2025-01-20 09:00:00-03'),
    
    -- Diagnóstico para 'Jazmín' (plant_id: 4)
    (4, 'no disease', 99.00, 'Buen estado general.', '2025-01-22 16:45:00-03'),
    
    -- Diagnóstico para 'Serrucho' (plant_id: 5)
    (5, 'no disease', 98.50, 'La planta está en perfectas condiciones de salud.', '2025-01-25 11:20:00-03');