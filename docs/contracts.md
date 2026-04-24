# RecurNote - Contracts

## Listado de Módulos y Specs

| Módulo | Archivo Spec | Descripción |
|--------|--------------|-------------|
| **Items (CRUD + Sync)** | `spec_m1_items.md` | Gestión completa de items con sincronización optimista, cola debounced, undo/redo |
| **Auth** | `spec_m2_auth.md` | Autenticación con JWT, registro, login, verificación de email |
| **Payment** | `spec_m3_payment.md` | Sistema de suscripciones y pagos via PayPal |

---

## Contracts

### Items Contract

**Ubicación**: `spec_m1_items.md`

**Descripción**: Manejo completo de items ( Notas, Tareas, Archivos) con:
- CRUD con sincronización optimista
- Sistema de cola con debounce
- Control de concurrencia (in-flight limit)
- Undo/Redo (50 acciones)
- Fallback a localStorage

**API Base**: `/api/items`

**Estados de Item**:
- `tmp_*` - ID temporal (creación en progreso)
- `local_*` - ID local (modo offline)
- `(número)` - ID real (backend)

---

### Auth Contract

**Ubicación**: `spec_m2_auth.md`

**Descripción Autenticación con JWT (Access + Refresh tokens):
- Registro con código de verificación
- Login con email/password
- Verificación de email
- Reset de password
- Validación de tokens

**API Base**: `/api/auth`

---

### Payment Contract

**Ubicación**: `spec_m3_payment.md`

**Descripción Sistema de suscripciones:
- Planes (Free, VIP)
- Activation de suscripción vía PayPal
- Estado de suscripción en User

**API Base**: `/api/payment`

---

## Contratos Comunes

### Errors

| Código | Descripción |
|--------|-------------|
| `400` | Bad Request - Payload inválido |
| `401` | Unauthorized - Token no proporcionado o inválido |
| `403` | Forbidden - Límite alcanzado o acceso denegado |
| `404` | Not Found - Recurso no encontrado |
| `413` | Payload Too Large - Archivo muy grande |
| `500` | Internal Server Error |

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Formato de Fechas

- **Date**: ISO 8601 (`2026-04-23`)
- **DateTime**: ISO 8601 (`2026-04-23T10:00:00Z`)
- **Timestamps**: Unix epochms (`1713867600000`)