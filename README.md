# PawtoPaw - Backend API REST 🐾

Servidor backend y API REST para la plataforma **PawtoPaw**, construido con Node.js, Express y PostgreSQL. Gestiona la autenticación de usuarios mediante JWT, el catálogo de productos y servicios de petsitters, el registro de compras y las reseñas.

## 🚀 Tecnologías y Dependencias

* **Node.js & Express:** Servidor y enrutamiento de la API REST.
* **PostgreSQL (`pg`):** Conexión y consultas parametrizadas a la base de datos[cite: 2, 3].
* **JSON Web Token (`jsonwebtoken`) & `bcryptjs`:** Autenticación segura, firma de tokens y encriptación de contraseñas[cite: 2, 3].
* **CORS (`cors`):** Habilitación de consultas de orígenes cruzados[cite: 2, 3].
* **Jest & Supertest:** Pruebas unitarias y de integración para validar rutas y códigos de estado HTTP[cite: 1, 2, 3].

## 🛠️ Instalación y Configuración

1. Clonar el repositorio e instalar dependencias:

```Bash
git clone [https://github.com/Alexandrailp/pawtopaw-backend.git](https://github.com/Alexandrailp/pawtopaw-backend.git)
cd pawtopaw-backend
npm install
```

2. Configurar la base de datos PostgreSQL:
Ejecutar los comandos del archivo script.sql en psql o pgAdmin para crear la base de datos pawtopaw y sus tablas (usuario, tipo, articulo, compra, resena).

3. Configurar variables de entorno (.env):
Crear un archivo .env en la raíz con las credenciales locales de PostgreSQL:

Fragmento de código

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=pawtopaw
DB_PORT=5432
PORT=3000
```

4. Ejecución del servidor y pruebas:

- Modo desarrollo: npm run dev
- Modo producción: npm start
- Ejecutar suite de tests: npm test

## 📌 Endpoints de la API REST

| Método | Ruta | Autenticación | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/usuarios` | No | Registra un nuevo usuario en la base de datos. |
| `POST` | `/login` | No | Valida credenciales y retorna el token JWT junto a los datos del usuario. |
| `GET` | `/articulos` | No | Obtiene el listado completo de productos y servicios publicados. |
| `POST` | `/articulos` | Sí (`Bearer Token`) | Crea una nueva publicación de producto o servicio. |
| `POST` | `/compras` | Sí (`Bearer Token`) | Registra una nueva orden de compra. |
| `POST` | `/resenas` | Sí (`Bearer Token`) | Registra una calificación y comentario sobre un artículo. |
