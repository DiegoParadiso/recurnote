# SPEC M2: Auth (Autenticación)

## Descripción del Módulo

Módulo de autenticación con JWT (Access + Refresh tokens), registro con verificación de email, login, y gestión de sesiones.

**Archivos relacionados**:
- `frontend/src/context/AuthContext.jsx` - Context de autenticación
- `backend/controllers/auth.controller.js` - Controlador backend
- `backend/routes/auth.routes.js` - Rutas
- `backend/middleware/auth.middleware.js` - Middleware de validación
- `backend/models/user.model.js` - Modelo de usuario

---

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registro de nuevo usuario |
| `POST` | `/api/auth/login` | Login con email/password |
| `POST` | `/api/auth/verify-code` | Verificar código de 6 dígitos |
| `POST` | `/api/auth/resend-code` | Reenviar código de verificación |
| `POST` | `/api/auth/verify-email/:token` | Verificar email con token |
| `POST` | `/api/auth/resend-verification` | Reenviar email de verificación |
| `POST` | `/api/auth/request-password-reset` | Solicitar reset de password |
| `POST` | `/api/auth/reset-password` | Resetear password |
| `GET` | `/api/auth/me` | Obtener datos del usuario actual |
| `PUT` | `/api/auth/preferences` | Actualizar preferencias |

---

## Flujo de Registro

```
1. POST /api/auth/register
   ↓ { name, email, password }
2. Servidor genera verification_code (6 dígitos)
   ↓ envíavia email
3. POST /api/auth/verify-code
   ↓ { email, code }
4. Email verificado → usuario activo
5. Access token + refresh token generados
```

---

## Flujo de Login

```
1. POST /api/auth/login
   ↓ { email, password }
2. Servidor valida credenciales (bcrypt)
3. Genera JWT (access + refresh)
4. Retorna tokens + datos de usuario
```

---

## Flujo de Password Reset

```
1. POST /api/auth/request-password-reset
   ↓ { email }
2. Servidor genera password_reset_token
   ↓ envía email con link
3. POST /api/auth/reset-password
   ↓ { token, newPassword }
4. Password actualizado (bcrypt hash)
```

---

## JWT Tokens

### Access Token
```javascript
{
  id: 1,
  email: "user@test.com"
}
// Expira en: 15 minutos
```

### Refresh Token
```javascript
{
  id: 1,
  type: "refresh"
}
// Expira en: 7 días
```

---

## Middleware de Autenticación

**Archivo**: `backend/middleware/auth.middleware.js`

```javascript
export async function authMiddleware(req, res, next) {
  // 1. Verificar header Authorization
  // 2. Validar JWT con JWT_SECRET
  // 3. Buscar usuario en DB
  // 4. Adjuntar req.user
}
```

---

## Modelo de Usuario (user.model.js)

```javascript
{
  id: INTEGER (PK),
  name: STRING(2-50),
  email: STRING (unique),
  password: STRING(8-128),  // bcrypt hash
  avatar_url: STRING,
  is_vip: BOOLEAN (default: false),
  subscription_status: STRING,
  trial_started_at: DATE,
  trial_ends_at: DATE,
  current_period_started_at: DATE,
  current_period_ends_at: DATE,
  auto_renew: BOOLEAN (default: true),
  preferences: JSONB ({}),
  email_verified: BOOLEAN (default: false),
  verification_code: STRING(6),
  verification_code_expires: DATE,
  email_verification_token: STRING,
  email_verification_expires: DATE,
  password_reset_token: STRING,
  password_reset_expires: DATE
}
```

---

## API Contracts

### POST /api/auth/register

**Request:**
```json
{
  "name": "Usuario",
  "email": "user@test.com",
  "password": "12345678"
}
```

**Response (201):**
```json
{
  "message": "Código de verificación enviado",
  "email": "user@test.com"
}
```

### POST /api/auth/login

**Request:**
```json
{
  "email": "user@test.com",
  "password": "12345678"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Usuario",
    "email": "user@test.com",
    "is_vip": false,
    "subscription_status": "trial"
  }
}
```

### POST /api/auth/verify-code

**Request:**
```json
{
  "email": "user@test.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verificado",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /api/auth/verify-email/:token

**Request:**
```http
POST /api/auth/verify-email/abc123token
```

**Response (200):**
```json
{
  "message": "Email verificado exitosamente"
}
```

### POST /api/auth/request-password-reset

**Request:**
```json
{
  "email": "user@test.com"
}
```

**Response (200):**
```json
{
  "message": "Email de recuperación enviado"
}
```

### POST /api/auth/reset-password

**Request:**
```json
{
  "token": "abc123token",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password actualizado"
}
```

### GET /api/auth/me

**Request:**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Usuario",
  "email": "user@test.com",
  "is_vip": false,
  "subscription_status": "trial",
  "preferences": {}
}
```

### PUT /api/auth/preferences

**Request:**
```json
{
  "preferences": {
    "theme": "dark",
    "language": "es"
  }
}
```

**Response (200):** Preferencias actualizadas

---

## Errores Comunes

| Código | Mensaje |
|--------|---------|
| `400` | "Email o password inválidos" |
| `401` | "Token no proporcionado" / "Token inválido" / "Usuario no encontrado" |
| `403` | "Código inválido o expirado" |
| `404` | "Usuario no encontrado" |
| `409` | "Email ya registrado" |
| `500` | "Error interno" |