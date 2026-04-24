# SPEC M1: Items (CRUD + Sync)

## Descripción del Módulo

Módulo de gestión de items (Notas, Tareas, Archivos) con sincronización optimista, sistema de cola con debounce, control de concurrencia, undo/redo y fallback a localStorage.

**Archivos相关性**:
- `frontend/src/context/ItemsContext.jsx` - Context principal
- `backend/controllers/item.controller.js` - Controlador backend
- `backend/models/item.model.js` - Modelo de datos
- `frontend/src/components/Circles/Items/` - Componentes de items

---

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/items` | Obtiene todos los items del usuario |
| `POST` | `/api/items` | Crea un nuevo item |
| `PUT` | `/api/items/:id` | Actualiza un item |
| `DELETE` | `/api/items/:id` | Elimina un item |

---

## Tipos de Items

### Nota (label: "Nota")
```json
{
  "label": "Nota",
  "content": "Texto de la nota",
  "width": 200,
  "height": 80,
  "position_ts": 1713867600000
}
```

### Tarea (label: "Tarea")
```json
{
  "label": "Tarea",
  "content": ["item 1", "item 2", "item 3"],
  "checked": [true, false, false],
  "width": 200,
  "height": 120,
  "position_ts": 1713867600000
}
```

### Archivo (label: "Archivo")
```json
{
  "label": "Archivo",
  "content": {
    "fileData": { "name": "archivo.pdf", "size": 1024, "type": "application/pdf" },
    "base64": "data:application/pdf;base64,..."
  },
  "width": 200,
  "height": 150,
  "position_ts": 1713867600000
}
```

---

## Flujo de Creación (Optimistic UI)

```
1. addItem() en frontend
   ↓ genera ID temporal tmp_*
2. Renderizado inmediato en UI (Optimistic)
   ↓
3. POST /api/items
   ↓
4. Servidor retorna ID real
   ↓
5. Frontend reemplaza tmp_* por ID real
   ↓
6. SI hubocambios durante espera → PUT con cambios
```

**Manejo de Race Conditions**:
- Se comparan timestamps (`position_ts`) antes de aplicar cambios geométricos
- Si el timestamp entrante es menor al actual, se descartan los cambios de posición

---

## Sistema de Cola (Debounced Queue)

### Parámetros de Debounce

| Tipo de Cambio | Debounce |
|---------------|----------|
| Texto | 1000ms |
| Geometría (drag) | 2000ms |
| Otros | 800ms |

### Control de Concurrencia (In-flight)

```javascript
const PENDING_LIMIT = 3;  // Máx. conexiones simultáneas
const inFlightRef = useRef(0);
```

- Si `inFlightRef >= PENDING_LIMIT`: las peticiones se encolan
- Retry después de 200ms

### Flush Forzado

Se activa en:
- `visibilitychange` (pestaña ocultada)
- `beforeunload` (cierre de pestaña)

---

## Undo / Redo

### Estructura del Historial

```javascript
undoStackRef = useRef([]);  // máx. 50 acciones
redoStackRef = useRef([]);
```

### Tipos de Acciones

| Tipo | Undo | Redo |
|------|-----|-----|
| `ADD` | Delete | Add |
| `UPDATE` | Revertir a prev | Aplicar next |
| `DELETE` | Restore item | Delete |

### Keyboard Shortcuts

| Shortcut | Acción |
|---------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Y` / `Cmd+Y` | Redo |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo |

### Captura de Estado

```javascript
captureUndoState(id);   // Antes de editar
commitUndoState(id);    // Después de confirmar cambio
```

---

## Fallback a LocalStorage

### Condición
```javascript
if (!user || !token) {
  // Usar localStorage
}
```

### Límites

| Recurso | Valor |
|---------|-------|
| Items máximos | 5 |
| IDs | `local_*` |

### Métodos

```javascript
loadLocalItems()   // Cargar desde localStorage
saveLocalItems()  // Guardar en localStorage
```

---

## Modelo de Datos (item.model.js)

```javascript
{
  id: INTEGER (PK),
  user_id: INTEGER (FK → Users.id),
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

---

## Restricciones por Tipo de Usuario

| Recurso | Free | VIP |
|---------|------|-----|
| Items totales | 15 | Ilimitado |
| Tamaño archivo | 3MB | Ilimitado |
| Sincronización cloud | No | Sí |

---

## Estados de Sincronización

| Estado | Condición |
|--------|-----------|
| `syncing` | `pendingOperations.size > 0` O `item._pending === true` O `loading === true` |
| `synced` | Ninguna operación pendiente |

---

## Constantes

| Constante | Valor |
|-----------|-------|
| `PENDING_LIMIT` | 3 |
| `UNDO_STACK_LIMIT` | 50 |
| `MAX_LOCAL_ITEMS` | 5 |
| `DEBOUNCE_TEXT` | 1000ms |
| `DEBOUNCE_DRAG` | 2000ms |
| `DEBOUNCE_OTHER` | 800ms |

---

## API Contracts

### GET /api/items

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
    "item_data": { "label": "Nota", "content": "...", "width": 200, "height": 80 },
    "created_at": "2026-04-23T10:00:00Z",
    "updated_at": "2026-04-23T10:00:00Z"
  }
]
```

### POST /api/items

**Request:**
```json
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

**Response (201):** Item creado con ID

**Errors:**
- `403`: "Límite alcanzado: las cuentas gratuitas pueden crear hasta 15 items."
- `413`: "El archivo excede el límite de 3MB para cuentas gratuitas."

### PUT /api/items/:id

**Request:**
```json
{
  "x": 160.5,
  "y": 230.3,
  "item_data": {
    "content": "Nuevo contenido",
    "position_ts": 1713867600000
  }
}
```

**Optimistic Concurrency:**
- Si `position_ts` entrante < `position_ts` actual → descartarcambios geométricos
- Actualizar `position_ts` solo si es mayor o igual

### DELETE /api/items/:id

**Response (200):** `{ "message": "Item eliminado" }`

---

## Errores Comunes

| Código | Mensaje |
|--------|---------|
| `400` | "Error al obtener items" |
| `401` | "Token no proporcionado" / "Token inválido" |
| `403` | "Límite alcanzado" |
| `404` | "Item no encontrado" |
| `413` | "El archivo excede el límite" |
| `500` | "Error al crear/actualizar item" |