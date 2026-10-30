const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ quiet: true });

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'pawtopaw',
        port: process.env.DB_PORT || 5432,
        allowExitOnIdle: true
      }
);

const registrarUsuario = async (nombre, email, password) => {
  const passwordEncriptada = bcrypt.hashSync(password, 10);
  const consulta = 'INSERT INTO usuario (nombre, email, password) VALUES ($1, $2, $3) RETURNING id';
  const values = [nombre, email, passwordEncriptada];
  const { rows } = await pool.query(consulta, values);
  return rows[0];
};

const verificarCredenciales = async (email, password) => {
  const consulta = 'SELECT * FROM usuario WHERE email = $1';
  const { rows, rowCount } = await pool.query(consulta, [email]);
  if (!rowCount) {
    throw { code: 401, message: 'Email o contraseña incorrecta' };
  }
  const usuario = rows[0];
  const passwordEsCorrecta = bcrypt.compareSync(password, usuario.password);
  if (!passwordEsCorrecta) {
    throw { code: 401, message: 'Email o contraseña incorrecta' };
  }
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email
  };
};

const obtenerArticulos = async () => {
  const consulta = `
    SELECT a.id, a.titulo, a.precio, a.imagen, a.tipo_id, a.usuario_id,
           u.nombre AS vendedor, u.email AS usuario_email
    FROM articulo a
    LEFT JOIN usuario u ON a.usuario_id = u.id
    ORDER BY a.id DESC
  `;
  const { rows } = await pool.query(consulta);
  return rows;
};

const crearArticulo = async (titulo, precio, imagen, usuario_id, tipo_id) => {
  const consulta = 'INSERT INTO articulo (titulo, precio, imagen, usuario_id, tipo_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, usuario_id';
  const values = [titulo, precio, imagen, usuario_id, tipo_id];
  const { rows } = await pool.query(consulta, values);
  return rows[0];
};

const registrarCompra = async (usuario_id, articulo_id) => {
  const consulta = 'INSERT INTO compra (usuario_id, articulo_id) VALUES ($1, $2) RETURNING estado';
  const values = [usuario_id, articulo_id];
  const { rows } = await pool.query(consulta, values);
  return rows[0];
};

const registrarResena = async (comentario, calificacion, usuario_id, articulo_id) => {
  const consulta = 'INSERT INTO resena (comentario, calificacion, usuario_id, articulo_id) VALUES ($1, $2, $3, $4) RETURNING id';
  const values = [comentario, calificacion, usuario_id, articulo_id];
  const { rows } = await pool.query(consulta, values);
  return rows[0];
};

const eliminarArticulo = async (id) => {
  const consulta = 'DELETE FROM articulo WHERE id = $1 RETURNING id';
  const { rows } = await pool.query(consulta, [id]);
  return rows[0];
};

const editarArticulo = async (id, titulo, precio, imagen, tipo_id) => {
  const consulta = 'UPDATE articulo SET titulo = $1, precio = $2, imagen = $3, tipo_id = $4 WHERE id = $5 RETURNING *';
  const values = [titulo, precio, imagen, tipo_id, id];
  const { rows } = await pool.query(consulta, values);
  return rows[0];
};

module.exports = {
  pool,
  registrarUsuario,
  verificarCredenciales,
  obtenerArticulos,
  crearArticulo,
  eliminarArticulo,
  editarArticulo,
  registrarCompra,
  registrarResena
};