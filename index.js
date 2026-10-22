const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { secretKey } = require('./secretKey');
const {
  registrarUsuario,
  verificarCredenciales,
  obtenerArticulos,
  crearArticulo,
  registrarCompra,
  registrarResena
} = require('./consultas');
const {
  validarCredenciales,
  validarRegistro,
  verificarToken
} = require('./middlewares');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/usuarios', validarRegistro, async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const nuevoUsuario = await registrarUsuario(nombre, email, password);
    res.status(201).json({
      mensaje: 'Usuario registrado con éxito',
      usuario_id: nuevoUsuario.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
});

app.post('/login', validarCredenciales, async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await verificarCredenciales(email, password);
    const token = jwt.sign({ email: usuario.email, id: usuario.id }, secretKey, { expiresIn: '24h' });
    res.status(200).json({
      token,
      usuario
    });
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message || 'Error en el servidor' });
  }
});

app.get('/articulos', async (req, res) => {
  try {
    const articulos = await obtenerArticulos();
    res.status(200).json(articulos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los artículos' });
  }
});

app.post('/articulos', verificarToken, async (req, res) => {
  try {
    const { titulo, precio, imagen, usuario_id, tipo_id } = req.body;
    if (!titulo || !precio || !imagen || !usuario_id || !tipo_id) {
      return res.status(400).json({ message: 'Faltan datos del artículo' });
    }
    const nuevoArticulo = await crearArticulo(titulo, precio, imagen, usuario_id, tipo_id);
    res.status(201).json({
      mensaje: 'Artículo publicado con éxito',
      articulo_id: nuevoArticulo.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el artículo' });
  }
});

app.post('/compras', verificarToken, async (req, res) => {
  try {
    const { usuario_id, articulo_id } = req.body;
    if (!usuario_id || !articulo_id) {
      return res.status(400).json({ message: 'Faltan datos de la compra' });
    }
    const compra = await registrarCompra(usuario_id, articulo_id);
    res.status(201).json({
      mensaje: 'Compra realizada con éxito',
      estado: compra.estado
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar la compra' });
  }
});

app.post('/resenas', verificarToken, async (req, res) => {
  try {
    const { comentario, calificacion, usuario_id, articulo_id } = req.body;
    if (!comentario || !calificacion || !usuario_id || !articulo_id) {
      return res.status(400).json({ message: 'Faltan datos de la reseña' });
    }
    await registrarResena(comentario, calificacion, usuario_id, articulo_id);
    res.status(201).json({
      mensaje: 'Reseña agregada con éxito'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar la reseña' });
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor de PawtoPaw encendido en http://localhost:${PORT}`);
  });
}

module.exports = app;