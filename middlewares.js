const jwt = require('jsonwebtoken');
const { secretKey } = require('./secretKey');

const validarCredenciales = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan credenciales (email o password)' });
  }
  next();
};

const validarRegistro = (req, res, next) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ message: 'Completa todos los campos requeridos' });
  }
  next();
};

const verificarToken = (req, res, next) => {
  const Authorization = req.header('Authorization');
  if (!Authorization) {
    return res.status(401).json({ message: 'Token no proporcionado en las cabeceras' });
  }

  const token = Authorization.split('Bearer ')[1] || Authorization;

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = {
  validarCredenciales,
  validarRegistro,
  verificarToken
};