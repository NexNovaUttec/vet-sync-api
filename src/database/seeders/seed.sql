-- SEED DATA - Datos iniciales para VetSync API

-- Categorías de Servicio
INSERT INTO public.categorias_servicio (nombre, descripcion)
VALUES ('Veterinaria', 'Servicios veterinarios'),
  ('Estetica', 'Servicios estéticos'),
  ON CONFLICT (nombre) DO NOTHING;


-- Servicios
INSERT INTO servicios (nombre, descripcion, categoria_id, precio, duracion_estimada) VALUES
('Consulta Médica General', 'Consulta médica general y chequeo de rutina', 1, 250.00, 30),
('Vacunación Básica', 'Aplicación de vacunas esenciales', 1, 300.00, 30),
('Vacunación Completa', 'Plan completo de vacunación anual', 1, 900.00, 30),
('Esterilización', 'Castración y esterilización', 1, 1200.00, 120),
('Radiografía', 'Estudio radiológico diagnóstico', 1, 400.00, 30),
('Ecografía', 'Estudio ecográfico diagnóstico', 1, 600.00, 45),
('Análisis de Sangre', 'Hemograma y química sanguínea', 1, 500.00, 30),
('Análisis de Orina', 'Urianálisis completo', 1, 250.00, 10),
('Consulta Nutricional', 'Asesoramiento nutricional especializado', 1, 300.00, 30),
('Atención de Heridas', 'Limpieza y curación de heridas', 1, 200.00, 30),
('Baño Básico', 'Baño con champú básico y secado', 2, 150.00, 30),
('Baño Premium', 'Baño con productos premium y acondicionador', 2, 250.00, 45),
('Corte de Pelo', 'Corte y arreglo del pelaje según raza', 2, 200.00, 60),
('Corte Creativo', 'Cortes creativos y diseños especiales', 2, 300.00, 90),
('Limpieza de Oídos', 'Limpieza profunda de oídos', 2, 100.00, 15),
('Cepillado de Dientes', 'Limpieza dental básica', 2, 150.00, 20),
('Spa Completo', 'Baño, corte, uñas, oídos y relajación', 2, 450.00, 120),
('Tratamiento Antipulgas', 'Baño medicado antipulgas y garrapatas', 2, 200.00, 50),
('Hidratación de Pelaje', 'Tratamiento hidratante para pelaje seco', 2, 150.00, 40),
('Pedicura Completa', 'Arreglo completo de patas y almohadillas', 2, 120.00, 20),
('Prueba', 'Servicio para probar api de servicios', 2, 250.00, 190),
('Desparasitación', 'Tratamiento antiparasitario interno y externo', 1, 250.00, 30);

-- Especies
INSERT INTO public.especies (nombre)
VALUES ('Perro'),
  ('Gato'),
  ('Hamster'),
  ('Tortuga'),
  ('Pez'),
  ('Pájaro'),
  ('Reptil');

-- Razas
INSERT INTO razas (nombre, especie_id) VALUES  
-- Razas de Perro (especie_id: 1)  
('Labrador Retriever', 1), ('Pastor Alemán', 1), ('Golden Retriever', 1), ('Bulldog Francés', 1), ('Beagle', 1),  
('Poodle', 1), ('Rottweiler', 1), ('Yorkshire Terrier', 1), ('Boxer', 1), ('Dachshund', 1),  
('Bulldog Inglés', 1), ('Doberman', 1), ('Husky Siberiano', 1), ('Gran Danés', 1), ('Chihuahua', 1),  
('Shih Tzu', 1), ('Pomerania', 1), ('Cocker Spaniel', 1), ('Boston Terrier', 1), ('Schnauzer', 1),  
('Australian Shepherd', 1), ('Cavalier King Charles Spaniel', 1), ('Bernese Mountain Dog', 1), ('Brittany', 1),  
('English Springer Spaniel', 1), ('Pug', 1), ('Mastiff', 1), ('Vizsla', 1), ('Cane Corso', 1),  
('Weimaraner', 1), ('Maltese', 1), ('Collie', 1), ('Newfoundland', 1), ('Border Collie', 1),  
('Basset Hound', 1), ('Rhodesian Ridgeback', 1), ('West Highland White Terrier', 1), ('Shiba Inu', 1),  
('Portuguese Water Dog', 1), ('Bichon Frise', 1), ('Akita', 1), ('San Bernardo', 1), ('Bloodhound', 1),  
('Chesapeake Bay Retriever', 1), ('Papillon', 1), ('Bullmastiff', 1), ('Australian Cattle Dog', 1),  
('Basenji', 1), ('Belgian Malinois', 1), ('Border Terrier', 1), ('Bull Terrier', 1), ('Cairn Terrier', 1),  
('Cardigan Welsh Corgi', 1), ('Chow Chow', 1), ('Dalmatian', 1), ('English Setter', 1),  
('Flat-Coated Retriever', 1), ('German Shorthaired Pointer', 1), ('Giant Schnauzer', 1), ('Greyhound', 1),  
('Irish Setter', 1), ('Italian Greyhound', 1), ('Jack Russell Terrier', 1), ('Keeshond', 1),  
('Lhasa Apso', 1), ('Miniature Pinscher', 1), ('Miniature Schnauzer', 1), ('Old English Sheepdog', 1),  
('Pekingese', 1), ('Pembroke Welsh Corgi', 1), ('Pharaoh Hound', 1), ('Pointer', 1), ('Rat Terrier', 1),  
('Samoyed', 1), ('Scottish Terrier', 1), ('Shar Pei', 1), ('Shetland Sheepdog', 1),  
('Staffordshire Bull Terrier', 1), ('Standard Poodle', 1), ('Toy Poodle', 1), ('Welsh Springer Spaniel', 1),  
('Whippet', 1), ('Wire Fox Terrier', 1), ('Xoloitzcuintli', 1), ('Afghan Hound', 1),  
('Alaskan Malamute', 1), ('American Bulldog', 1), ('American Pit Bull Terrier', 1), ('English Mastiff', 1),  
('French Mastiff', 1), ('Ibizan Hound', 1), ('Irish Wolfhound', 1), ('Kangal', 1), ('Leonberger', 1),  
('Norwegian Elkhound', 1), ('Saluki', 1), ('Tibetan Mastiff', 1),  
-- Razas de Gato (especie_id: 2)  
('Siamés', 2), ('Persa', 2), ('Maine Coon', 2), ('Bengala', 2), ('Sphynx', 2), ('Ragdoll', 2),  
('Británico de pelo corto', 2), ('Abisinio', 2), ('Scottish Fold', 2), ('Devon Rex', 2), ('Oriental', 2),  
('Noruego del Bosque', 2), ('Birmano', 2), ('Tonkinés', 2), ('Ocicat', 2), ('American Bobtail', 2),  
('American Curl', 2), ('American Wirehair', 2), ('Bombay', 2), ('Burmilla', 2),  
('California Spangled', 2), ('Chausie', 2), ('Cymric', 2), ('Egyptian Mau', 2), ('Exotic Shorthair', 2),  
('Havana Brown', 2), ('Highlander', 2), ('Himalayan', 2), ('Khao Manee', 2), ('Korat', 2),  
('LaPerm', 2), ('Munchkin', 2), ('Nebelung', 2), ('Pixie-Bob', 2), ('Ragamuffin', 2), ('Savannah', 2),  
('Selkirk Rex', 2), ('Serengeti', 2), ('Snowshoe', 2), ('Thai', 2), ('Toyger', 2), ('Turkish Angora', 2),  
('Ukrainian Levkoy', 2), ('Balinese', 2), ('Chartreux', 2), ('Cornish Rex', 2), ('Japanese Bobtail', 2),  
('Manx', 2), ('Russian Blue', 2), ('Siberian', 2), ('Somali', 2), ('Turkish Van', 2),  
-- Razas de Hámster (especie_id: 3)  
('Hámster Sirio', 3), ('Hámster Ruso Campbell', 3), ('Hámster Ruso Blanco de Invierno', 3),  
('Hámster Roborovski', 3), ('Hámster Chino', 3),  
-- Razas de Tortuga (especie_id: 4)  
('Tortuga de Orejas Rojas', 4), ('Tortuga Caja', 4), ('Tortuga Pintada', 4), ('Tortuga Rusa', 4),  
('Tortuga Griega', 4), ('Tortuga de Hermann', 4), ('Tortuga de Cuello Lateral Africana', 4),  
('Tortuga Almizclera', 4), ('Tortuga Mapa', 4), ('Tortuga de Caparazón Blando', 4),  
('Tortuga Mordedora', 4), ('Tortuga de Barro', 4), ('Tortuga de Diamante', 4), ('Tortuga de Madera', 4),  
('Tortuga Manchada', 4), ('Tortuga de Pantano', 4), ('Tortuga del Desierto', 4), ('Tortuga Gopher', 4),  
('Tortuga Leopardo', 4), ('Tortuga Radiada', 4), ('Tortuga Sulcata', 4), ('Tortuga Estrellada', 4),  
-- Razas de Pez (especie_id: 5)  
('Pez Dorado', 5), ('Pez Betta', 5), ('Guppy', 5), ('Tetra Neón', 5), ('Pez Ángel', 5), ('Disco', 5),  
('Molly', 5), ('Platy', 5), ('Cola de Espada', 5), ('Corydoras', 5), ('Pez Gato Plecostomus', 5),  
('Pez Arcoíris', 5), ('Killifish', 5), ('Danio', 5), ('Barbo', 5), ('Gourami', 5), ('Pez Payaso', 5),  
('Tang', 5), ('Damisela', 5), ('Wrasse', 5), ('Blenny', 5), ('Pez Globo', 5), ('Caballito de Mar', 5),  
('Pez Pipa', 5), ('Pez Mandarín', 5), ('Pez León', 5), ('Pez Gatillo', 5), ('Pez Loro', 5),  
('Pez Cirujano', 5), ('Pez Mariposa', 5), ('Pez Rape', 5), ('Pez Cebra', 5), ('Pez Óscar', 5),  
('Pez Koi', 5), ('Pez Arowana', 5),  
-- Razas de Pájaro (especie_id: 6)  
('Periquito', 6), ('Cacatúa Ninfa', 6), ('Agapornis', 6), ('Loro Gris Africano', 6), ('Loro Amazona', 6),  
('Guacamayo', 6), ('Cacatúa', 6), ('Pinzón', 6), ('Canario', 6), ('Paloma', 6), ('Codorniz', 6),  
('Loro Eclectus', 6), ('Loro Senegal', 6), ('Loro Pionus', 6), ('Loro Quaker', 6), ('Loro Meyer', 6),  
('Caique', 6), ('Lory', 6), ('Lorikeet', 6), ('Rosella', 6), ('Periquito de Bourke', 6),  
('Periquito Lineolated', 6), ('Pinzón Cebra', 6), ('Pinzón Sociedad', 6), ('Pinzón Gouldian', 6),  
('Gorrión de Java', 6), ('Paloma Diamante', 6), ('Paloma de Collar', 6), ('Codorniz Botón', 6),  
('Loro Conure', 6), ('Loro Parrotlet', 6),  
-- Razas de Reptil (especie_id: 7)  
('Dragón Barbudo', 7), ('Gecko Leopardo', 7), ('Pitón Bola', 7), ('Serpiente del Maíz', 7),  
('Iguana Verde', 7), ('Tortuga de Tierra', 7), ('Gecko Crestado', 7), ('Serpiente Rey', 7),  
('Boa Constrictor', 7), ('Dragón de Agua Chino', 7), ('Anolis', 7), ('Eslizón', 7),  
('Lagarto Monitor', 7), ('Uromastyx', 7), ('Camaleón', 7), ('Gecko Gargoyle', 7), ('Gecko Tokay', 7),  
('Gecko de Cola Gorda', 7), ('Serpiente de Leche', 7), ('Serpiente Garter', 7), ('Serpiente Hognose', 7),  
('Boa Rosada', 7), ('Boa de Arena', 7), ('Pitón Alfombra', 7), ('Pitón Arborícola', 7),  
('Boa Arborícola Esmeralda', 7), ('Eslizón de Lengua Azul', 7), ('Eslizón de Fuego', 7), ('Tegu', 7),  
('Monitor Sabana', 7), ('Monitor del Nilo', 7), ('Tegu Argentino Blanco y Negro', 7),  
('Serpiente Taipán', 7), ('Lagarto de Collar', 7);

--Profesionales
-- INSERT para la tabla profesionales
INSERT INTO profesionales (nombre, apellido, email, telefono, especialidad) VALUES
('Danna', 'Ramirez', 'dannop@gmail.com','5574839248','Consultas Generales'),
('Ana', 'García', 'ana.garcia@vetclinic.com', '5551234567', 'Medicina Veterinaria General'),
('Carlos', 'Mendoza', 'carlos.mendoza@vetclinic.com', '5551234568', 'Medicina Veterinaria General'),
('María', 'López', 'maria.lopez@vetclinic.com', '5551234569', 'Medicina Veterinaria General'),
('Dr. Roberto', 'Hernández', 'roberto.hernandez@vetclinic.com', '5551234570', 'Cirugía Veterinaria'),
('Dra. Patricia', 'Ruiz', 'patricia.ruiz@vetclinic.com', '5551234571', 'Dermatología Veterinaria'),
('Dr. Miguel', 'Vargas', 'miguel.vargas@vetclinic.com', '5551234572', 'Cardiología Veterinaria'),
('Laura', 'Jiménez', 'laura.jimenez@vetclinic.com', '5551234573', 'Estética Canina'),
('Sofia', 'Torres', 'sofia.torres@vetclinic.com', '5551234574', 'Spa y Relajación Animal'),
('Juan', 'Ramírez', 'juan.ramirez@vetclinic.com', '5551234575', 'Radiología Veterinaria'),
('Carmen', 'Flores', 'carmen.flores@vetclinic.com', '5551234576', 'Laboratorio Clínico');

-- Horarios
INSERT INTO horarios_profesionales (profesional_id, dias_trabajo, hora_inicio, hora_fin) VALUES
('2c2d2ce0-e5b8-4f3f-8e6e-a4b78cc0a643', 'LMJV', '08:00:00', '17:00:00'),
('2c2d2ce0-e5b8-4f3f-8e6e-a4b78cc0a643', 'S', '09:00:00', '14:00:00'),
('34992607-a7b9-4bdd-8997-9f14cf0092f7', 'LMWV', '08:00:00', '16:00:00'),
('34992607-a7b9-4bdd-8997-9f14cf0092f7', 'S', '10:00:00', '15:00:00'),
('3780ca96-2361-4497-a5ff-016940f145d6', 'LWV', '09:00:00', '17:00:00'),
('3780ca96-2361-4497-a5ff-016940f145d6', 'S', '10:00:00', '13:00:00'),
('41f1bf1e-ceed-429f-b349-bb7b88d1e614', 'MW', '11:00:00', '19:00:00'),
('41f1bf1e-ceed-429f-b349-bb7b88d1e614', 'VSD', '10:00:00', '17:00:00'),
('533bb49a-2baa-47a5-b555-4c2b41e60790', 'LMWJV', '07:00:00', '15:00:00'),
('5f6362a0-fa26-4256-993e-16e40e9e2ad5', 'LMWJ', '10:00:00', '18:00:00'),
('5f6362a0-fa26-4256-993e-16e40e9e2ad5', 'V', '09:00:00', '15:00:00'),
('60987d16-17ff-4fe6-b6e5-5155e27add51', 'LMWJV', '07:00:00', '15:00:00'),
('60987d16-17ff-4fe6-b6e5-5155e27add51', 'S', '08:00:00', '12:00:00'),
('6190fa88-a6ef-4291-ba72-518a20087762', 'MJ', '08:00:00', '16:00:00'),
('6190fa88-a6ef-4291-ba72-518a20087762', 'V', '14:00:00', '19:00:00'),
('991e1575-62d3-4e1a-a55c-3b255b9b830d', 'MW', '14:00:00', '20:00:00'),
('991e1575-62d3-4e1a-a55c-3b255b9b830d', 'SD', '10:00:00', '16:00:00'),
('b46cf527-11f9-4cfd-be1d-af4c06a5f691', 'MWV', '06:00:00', '14:00:00'),
('b46cf527-11f9-4cfd-be1d-af4c06a5f691', 'LJ', '10:00:00', '18:00:00'),
('d783abb6-6a4c-4436-bfd9-d7bc099bf84b', 'LMWJ', '06:30:00', '14:30:00'),
('d783abb6-6a4c-4436-bfd9-d7bc099bf84b', 'V', '07:00:00', '13:00:00');

--Profesionales categorias
INSERT INTO profesional_categorias (profesional_id, categoria_id) VALUES
-- Danna Ramirez - Consultas Generales (Veterinaria)
('2c2d2ce0-e5b8-4f3f-8e6e-a4b78cc0a643', 1),
-- Ana García - Medicina Veterinaria General (Veterinaria)
('34992607-a7b9-4bdd-8997-9f14cf0092f7', 1),
-- Dra. Patricia Ruiz - Dermatología Veterinaria (Veterinaria)
('3780ca96-2361-4497-a5ff-016940f145d6', 1),
-- María López - Medicina Veterinaria General (Veterinaria)
('533bb49a-2baa-47a5-b555-4c2b41e60790', 1),
-- Juan Ramírez - Radiología Veterinaria (Veterinaria)
('60987d16-17ff-4fe6-b6e5-5155e27add51', 1),
-- Dr. Miguel Vargas - Cardiología Veterinaria (Veterinaria)
('6190fa88-a6ef-4291-ba72-518a20087762', 1),
-- Carlos Mendoza - Medicina Veterinaria General (Veterinaria)
('991e1575-62d3-4e1a-a55c-3b255b9b830d', 1),
-- Dr. Roberto Hernández - Cirugía Veterinaria (Veterinaria)
('b46cf527-11f9-4cfd-be1d-af4c06a5f691', 1),
-- Carmen Flores - Laboratorio Clínico (Veterinaria - apoyo diagnóstico)
('d783abb6-6a4c-4436-bfd9-d7bc099bf84b', 1),

-- CATEGORÍA ESTÉTICA (ID: 2)
-- Laura Jiménez - Estética Canina (Estética)
('5f6362a0-fa26-4256-993e-16e40e9e2ad5', 2),
-- Sofia Torres - Spa y Relajación Animal (Estética)
('41f1bf1e-ceed-429f-b349-bb7b88d1e614', 2),

-- PROFESIONALES MULTIDISCIPLINARIOS (ambas categorías)
-- Danna Ramirez - Consultas Generales (también puede hacer servicios estéticos básicos)
('2c2d2ce0-e5b8-4f3f-8e6e-a4b78cc0a643', 2),
-- Ana García - Medicina General (también capacitada en estética básica)
('34992607-a7b9-4bdd-8997-9f14cf0092f7', 2),
-- María López - Medicina General (también puede hacer servicios estéticos)
('533bb49a-2baa-47a5-b555-4c2b41e60790', 2);