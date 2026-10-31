const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { secretKey } = require('./secretKey');
const {
  registrarUsuario,
  verificarCredenciales,
  actualizarUsuario,
  obtenerArticulos,
  crearArticulo,
  eliminarArticulo,
  editarArticulo,
  registrarCompra,
  registrarResena,
  obtenerResenasPorArticulo
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

app.put('/usuarios/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;
    if (!nombre || !email) {
      return res.status(400).json({ message: 'Nombre y email son requeridos' });
    }
    const tokenUserId = req.user?.id;
    if (tokenUserId && Number(tokenUserId) !== Number(id)) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este perfil' });
    }
    const usuarioActualizado = await actualizarUsuario(id, nombre, email);
    if (!usuarioActualizado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({
      mensaje: 'Perfil actualizado con éxito',
      usuario: usuarioActualizado
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
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
    const { titulo, precio, imagen, tipo_id } = req.body;
    const usuario_id = req.user?.id || req.body.usuario_id;
    if (!titulo || !precio || !imagen || !usuario_id || !tipo_id) {
      return res.status(400).json({ message: 'Faltan datos del artículo o usuario_id' });
    }
    const nuevoArticulo = await crearArticulo(titulo, precio, imagen, usuario_id, tipo_id);
    res.status(201).json({
      mensaje: 'Artículo publicado con éxito',
      articulo_id: nuevoArticulo.id,
      usuario_id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el artículo' });
  }
});

app.put('/articulos/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, precio, imagen, tipo_id } = req.body;
    const actualizado = await editarArticulo(id, titulo, precio, imagen, tipo_id);
    if (!actualizado) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }
    res.status(200).json({ mensaje: 'Artículo actualizado con éxito', articulo: actualizado });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el artículo' });
  }
});

app.delete('/articulos/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await eliminarArticulo(id);
    if (!eliminado) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }
    res.status(200).json({ mensaje: 'Artículo eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el artículo' });
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

app.get('/articulos/:id/resenas', async (req, res) => {
  try {
    const { id } = req.params;
    const resenas = await obtenerResenasPorArticulo(id);
    res.status(200).json(resenas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las reseñas del artículo', error: error.message });
  }
});

app.post('/resenas', verificarToken, async (req, res) => {
  try {
    const usuario_id = req.user?.id || req.body.usuario_id;
    const { comentario, calificacion, articulo_id } = req.body;
    if (!comentario || !calificacion || !usuario_id || !articulo_id) {
      return res.status(400).json({ message: 'Faltan datos de la reseña' });
    }
    const califNum = parseInt(calificacion, 10);
    if (isNaN(califNum) || califNum < 1 || califNum > 5) {
      return res.status(400).json({ message: 'La calificación debe ser entre 1 y 5 estrellas' });
    }
    const nuevaResena = await registrarResena(comentario, califNum, usuario_id, articulo_id);
    res.status(201).json({
      mensaje: 'Reseña agregada con éxito',
      resena: nuevaResena
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar la reseña', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor de PawtoPaw encendido en http://localhost:${PORT}`);
  });
}

module.exports = app;