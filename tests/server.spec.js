const request = require('supertest');
const app = require('../index');
const { pool } = require('../consultas');

describe('Operaciones CRUD y Autenticación de PawtoPaw API', () => {
  let tokenValido = '';
  let usuarioId = null;
  const emailPrueba = `test_${Date.now()}@pawtopaw.cl`;

  afterAll(async () => {
    if (usuarioId) {
      await pool.query('DELETE FROM usuario WHERE id = $1', [usuarioId]);
    }
    await pool.end();
  });

  it('1. GET /articulos devuelve un status 200 y un arreglo con al menos 1 objeto', async () => {
    const response = await request(app).get('/articulos').send();
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('2. POST /usuarios registra un nuevo usuario y devuelve status 201', async () => {
    const nuevoUsuario = {
      nombre: 'Usuario Test',
      email: emailPrueba,
      password: 'password123'
    };
    const response = await request(app).post('/usuarios').send(nuevoUsuario);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('usuario_id');
    usuarioId = response.body.usuario_id;
  });

  it('3. POST /login autentica al usuario y devuelve status 200 con un token JWT', async () => {
    const credenciales = {
      email: emailPrueba,
      password: 'password123'
    };
    const response = await request(app).post('/login').send(credenciales);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    tokenValido = response.body.token;
  });

  it('4. POST /login con credenciales incompletas devuelve status 400', async () => {
    const response = await request(app).post('/login').send({ email: emailPrueba });
    expect(response.statusCode).toBe(400);
  });

  it('5. POST /articulos sin enviar token en cabeceras devuelve status 401', async () => {
    const nuevoArticulo = {
      titulo: 'Collar Reflectante',
      precio: 6000,
      imagen: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500',
      usuario_id: 1,
      tipo_id: 1
    };
    const response = await request(app).post('/articulos').send(nuevoArticulo);
    expect(response.statusCode).toBe(401);
  });

  it('6. POST /compras enviando un token válido registra la compra y devuelve status 201', async () => {
    const nuevaCompra = {
      usuario_id: usuarioId,
      articulo_id: 1
    };
    const response = await request(app)
      .post('/compras')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send(nuevaCompra);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('estado');
  });
});