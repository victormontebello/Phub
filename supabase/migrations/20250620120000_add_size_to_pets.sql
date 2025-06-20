-- Cria um novo tipo ENUM para o porte do pet
CREATE TYPE pet_portage AS ENUM ('pequeno', 'medio', 'grande');

-- Adiciona a coluna 'portage' na tabela 'pets' utilizando o novo tipo
ALTER TABLE pets
ADD COLUMN portage pet_portage; 