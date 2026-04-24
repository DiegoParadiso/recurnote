# RecurNote - Project Documentation

## Stack

### Frontend
- **Framework**: React 18 (SPA) con Vite
- **Styling**: Tailwind CSS 3.4
- **State Management**: React Context API
- **Routing**: React Router DOM 7
- **Date/Time**: Luxon 3
- **i18n**: i18next 25
- **Icons**: Lucide React
- **Payment**: @paypal/react-paypal-js
- **Fonts**: @fontsource/inter

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.18
- **ORM**: Sequelize 6.37
- **Database**: PostgreSQL (Neon, con SSL)
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **Email**: Resend API
- **Passport**: passport 0.7

---

## Convenciones de Código

### Estructura de Componentes React
```
ComponentName/
├── ComponentName.jsx      (componente principal)
├── ComponentNameContainer.jsx (lógica + estado)
├── ComponentNameEditor.jsx (modo edición)
└── ComponentNameClock.jsx  (funcionalidad horaria)
```

### Contextos
- `ItemsContext.jsx` - Gestión central de items
- `AuthContext.jsx` - Autenticación
- `ThemeContext.jsx` - Tema visual
- `NotesContext.jsx` - Estado del día seleccionado

### Naming Conventions
- **Componentes**: PascalCase (`CircleLarge.jsx`, `NoteItem.jsx`)
- **Hooks**: camelCase con prefijo `use` (`useHomeLogic.js`, `useDragResize.js`)
- **Utils**: camelCase (`date.js`, `geometry.js`)
- **Constantes**: UPPER_SNAKE_CASE

### Estado Global
- React Context APIstrictopara estados globales
- useRef пара efectos secundarios y valores mutable
- useCallback пара funciones memoizadas

### Patrones Principales
- **Optimistic UI**: renderizado inmediato con ID temporal
- **Debounced Queue**: coalescencia de updates
- **In-flight Control**: máximo 3 conexiones simultáneas
- **Fallback localStorage**: modo offline

---

## Estructura de Directorios

### Frontend (`frontend/src/`)

```
frontend/
├── context/                 # Contextos de React
│   ├── ItemsContext.jsx    # CRUD + sync + undo/redo
│   ├── AuthContext.jsx     # Autenticación
│   ├── ThemeContext.jsx   # Tema visual
│   └── NotesContext.jsx  # Día seleccionado
│
├── components/
│   ├── Circles/           # Sistema circular
│   │   ├── CircleLarge/  # Círculo mensual
│   │   ├── CircleSmall/ # Círculo de día
│   │   └── Items/       # Items (NoteItem, TaskItem, ArchiveItem)
│   ├── common/           # Componentes reutilizables
│   │   ├── Loader.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   └── DragTrashZone.jsx
│   ├── layout/           # Layouts
│   │   └── Sidebars/    # Sidebars
│   └── Premium/         # Componentes premium
│
├── pages/
│   ├── Home.jsx
│   └── Auth/
│       ├── Login.jsx
│       └── Register.jsx
│
├── hooks/
│   ├── data/
│   │   └── useItemsForDays.js
│   ├── ui/
│   │   ├── useDragResize.js
│   │   └── useHomeLogic.js
│   └── useIsMobile.js
│
├── utils/
│   ├── helpers/
│   │   ├── date.js
│   │   └── geometry.js
│   ├── formatDateKey.js
│   └── getDaysInMonth.js
│
├── styles/
└── i18n/
```

### Backend (`backend/`)

```
backend/
├── controllers/
│   ├── auth.controller.js
│   ├── item.controller.js
│   └── payment.controller.js
│
├── models/
│   ├── item.model.js
│   ├── user.model.js
│   └── index.js
│
├── routes/
│   ├── auth.routes.js
│   ├── item.routes.js
│   └── payment.routes.js
│
├── middleware/
│   └── auth.middleware.js
│
├── services/
│   └── email.service.js
│
├── config/
│   └── db.js
│
└── utils/
    └── rls.utils.js
```

---

## Modelos de Datos

### User Model (`backend/models/user.model.js`)

```javascript
{
  id: INTEGER (PK, auto_increment),
  name: STRING(2-50),
  email: STRING (unique),
  password: STRING(8-128),
  avatar_url: STRING,
  is_vip: BOOLEAN (default: false),
  subscription_status: STRING,    // 'active', 'trial', 'expired', 'cancelled'
  trial_started_at: DATE,
  trial_ends_at: DATE,
  current_period_started_at: DATE,
  current_period_ends_at: DATE,
  auto_renew: BOOLEAN (default: true),
  preferences: JSONB ({})
  email_verified: BOOLEAN (default: false),
  verification_code: STRING(6),
  verification_code_expires: DATE,
  email_verification_token: STRING,
  email_verification_expires: DATE,
  password_reset_token: STRING,
  password_reset_expires: DATE
}
```

### Item Model (`backend/models/item.model.js`)

```javascript
{
  id: INTEGER (PK, auto_increment),
  user_id: INTEGER (FK → Users.id, ON DELETE CASCADE),
  date: DATEONLY,
  x: NUMERIC(10,2),
  y: NUMERIC(10,2),
  fullboard_x: NUMERIC(10,2),
  fullboard_y: NUMERIC(10,2),
  rotation: NUMERIC(10,2) (default: 0),
  rotation_enabled: BOOLEAN (default: true),
  item_data: JSONB
}
```

### item_data (JSONB - Polimórfico)

**Nota:**
```json
{ "label": "Nota", "content": "texto", "width": 200, "height": 80 }
```

**Tarea:**
```json
{ "label": "Tarea", "content": ["item1", "item2"], "checked": [true, false], "width": 200, "height": 120 }
```

**Archivo:**
```json
{ "label": "Archivo", "content": { "fileData": {...}, "base64": "data:..." }, "width": 200, "height": 150 }
```

---

## Dependencias

### package.json (Frontend)
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.7.1",
  "luxon": "^3.6.1",
  "i18next": "^25.5.2",
  "lucide-react": "^0.525.0",
  "@paypal/react-paypal-js": "^8.9.2",
  "@fontsource/inter": "^5.2.8",
  "tailwindcss": "^3.4.17"
}
```

### package.json (Backend)
```json
{
  "express": "^4.18.2",
  "sequelize": "^6.37.7",
  "pg": "^8.16.3",
  "bcrypt": "^6.0.0",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "passport": "^0.7.0",
  "resend": "^6.2.2"
}
```

---

## API: Formatos de Responses y Requests

### Items API

#### GET /api/items
**Request:**
```http
GET /api/items
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "date": "2026-04-23",
    "x": 150.5,
    "y": 220.3,
    "fullboard_x": null,
    "fullboard_y": null,
    "rotation": 45,
    "rotation_enabled": true,
    "item_data": {
      "label": "Nota",
      "content": "Mi nota",
      "width": 200,
      "height": 80
    },
    "created_at": "2026-04-23T10:00:00Z",
    "updated_at": "2026-04-23T10:00:00Z"
  }
]
```

#### POST /api/items
**Request:**
```http
POST /api/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-04-23",
  "x": 150.5,
  "y": 220.3,
  "rotation": 45,
  "rotation_enabled": true,
  "item_data": {
    "label": "Nota",
    "content": "Mi nota",
    "width": 200,
    "height": 80
  }
}
```

**Response (201):**
```json
{
  "id": 2,
  "user_id": 1,
  "date": "2026-04-23",
  "x": 150.5,
  "y": 220.3,
  "rotation": 45,
  "rotation_enabled": true,
  "item_data": { ... },
  "created_at": "2026-04-23T10:00:00Z",
  "updated_at": "2026-04-23T10:00:00Z"
}
```

**Error Responses:**
- `403`: Límite alcanzado (15 items para free)
- `413`: Archivo > 3MB para free
- `500`: Error interno

#### PUT /api/items/:id
**Request:**
```http
PUT /api/items/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "x": 160.5,
  "y": 230.3,
  "item_data": {
    "content": "Nuevo contenido",
    "position_ts": 1713867600000
  }
}
```

**Response (200):** item actualizado

#### DELETE /api/items/:id
**Request:**
```http
DELETE /api/items/:id
Authorization: Bearer <token>
```

**Response (200):** `{ "message": "Item eliminado" }`

---

### Auth API

#### POST /api/auth/register
```json
{ "name": "Usuario", "email": "mail@test.com", "password": "12345678" }
```

#### POST /api/auth/login
```json
{ "email": "mail@test.com", "password": "12345678" }
```

**Response:**
```json
{
  "token": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": { "id": 1, "name": "Usuario", "email": "mail@test.com", "is_vip": false }
}
```

---

### Payment API

#### POST /api/payment/get-plan
```json
{ "planId": "FREE", "currency": "USD" }
```

#### POST /api/payment/activate-subscription
```json
{ "planId": "VIP_MONTHLY", "paymentId": "PAY-..." }
```

---

## Environments

- `VITE_API_URL`: URL del backend (default: http://localhost:5000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret para JWT
- `RESEND_API_KEY`: API key para Resend
- `PAYPAL_CLIENT_ID`: Client ID de PayPal

---

## Deuda Técnica y Roadmap (Áreas de Mejora Críticas)

El diseño actual permite una iteración rápida (MVP), pero presenta deudas técnicas significativas que deben abordarse antes de escalar a producción o habilitar concurrencia real.

A continuación, el orden estricto de prioridades para abordar estas mejoras reales (no cosméticas):

### 1. Control de Concurrencia + Versionado en Items
- **Problema:** El cliente asume el éxito sin versionado. Si hay dos dispositivos editando el mismo ítem, el último en guardar sobrescribe al otro de forma silenciosa. Esto rompe la consistencia y el historial local de Undo/Redo.
- **Solución Necesaria:** Añadir un control de concurrencia optimista estricto. Agregar campo `version` (entero) en el modelo de Items. Validar en el backend que el update corresponde a la versión esperada, devolviendo conflictos (HTTP 409) si difiere. El cliente debe lidiar con la falla.

### 2. Diseño Real de Sync y Contrato Offline-First (MVP)
- **Problema:** El frontend opera optimista/offline-first pero el backend asume validación síncrona REST clásica. 
- **Solución Necesaria:** Mínimo viable para reconciliación. Devolver pares concisos (`client_id` -> `server_id`) en creación. Integrar endpoints de `/sync` que procesen lotes (batch) o manejen deltas, acompañados de marcas de tiempo del cliente para resolución básica de conflictos.

### 3. Desacoplar Payment de PayPal + Webhooks
- **Problema:** Lógica estrictamente acoplada a PayPal (`paymentId`). Propensa a fallos con cobros pendientes/fallidos.
- **Solución Necesaria:** Proveedor abstracto en base de datos (`provider_id`, `provider_type`, `status`). Sumar sistema de Webhook routing fundamental para que las suscripciones reaccionen al estado real de la pasarela y hacer la reconciliación.

### 4. Endurecer Auth (Refresh, Revocación)
- **Problema:** El MVP no tiene políticas para el ciclo vital completo de sesiones públicas en producción.
- **Solución Necesaria:** Implementar rotación de Refresh Tokens transparente en cliente. Añadir tabla/mecanismo de revocación de sesiones (desconectar otros dispositivos) y Rate Limiting agresivo en rutas críticas.

### 5. Reducir Dependencia de JSONB para Datos Críticos (`item_data`)
- **Problema:** El blob JSONB no es escalable para búsquedas o indexado de texto.
- **Solución Necesaria:** Extraer variables críticas sin perder flexibilidad. Añadir columna `type` ('nota', 'tarea', etc.) y `content_text` (para permitir queries FTS/indexadas) e independizar estos valores del blob bruto.