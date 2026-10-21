CREATE DATABASE pawtopaw;

\c pawtopaw;

CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE tipo (
  id SERIAL PRIMARY KEY,
  descripcion VARCHAR(100) NOT NULL
);

CREATE TABLE articulo (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  precio INTEGER NOT NULL,
  imagen TEXT NOT NULL,
  usuario_id INTEGER REFERENCES usuario(id) ON DELETE CASCADE,
  tipo_id INTEGER REFERENCES tipo(id) ON DELETE SET NULL
);

CREATE TABLE compra (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50) DEFAULT 'En camino',
  usuario_id INTEGER REFERENCES usuario(id) ON DELETE CASCADE,
  articulo_id INTEGER REFERENCES articulo(id) ON DELETE CASCADE
);

CREATE TABLE resena (
  id SERIAL PRIMARY KEY,
  comentario TEXT NOT NULL,
  calificacion INTEGER NOT NULL,
  usuario_id INTEGER REFERENCES usuario(id) ON DELETE CASCADE,
  articulo_id INTEGER REFERENCES articulo(id) ON DELETE CASCADE
);

INSERT INTO tipo (descripcion) VALUES 
('producto'),
('petsitter');

INSERT INTO usuario (nombre, email, password) VALUES 
('Camila Rojas', 'camila@pawtopaw.cl', '$2a$10$X7G.e8z3/1wK8V0Z6q9yOuJ4L5mN2pQ8rS1tU3vW5xY7zA9bC1dE2');

INSERT INTO articulo (titulo, precio, imagen, usuario_id, tipo_id) VALUES
('Paseo de Perros 1 hr', 5000, 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=800', 1, 2),
('Casa para Gato', 15000, 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800', 1, 1),
('Alimento Premium 10kg', 35000, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800', 1, 1),
('Cuidado a domicilio (Día)', 20000, 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800', 1, 2),
('Juguete Cuerda Resistente', 8000, 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800', 1, 1),
('Guardería Diurna Felina', 12000, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 1, 2);