# SPEC M3: Payment (Suscripciones)

## Descripción del Módulo

Módulo de gestión de suscripciones y pagos via PayPal. Maneja planes Free y VIP, trial, y activación de suscripción.

**Archivos relacionados**:
- `backend/controllers/payment.controller.js` - Controlador backend
- `backend/routes/payment.routes.js` - Rutas
- `frontend/src/pages/Premium/PricingPage.jsx` - Página de precios
- `frontend/src/pages/Premium/PaymentPage.jsx` - Página de pago

---

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/payment/get-plan` | Obtener plan de suscripción |
| `POST` | `/api/payment/activate-subscription` | Activar suscripción |
| `GET` | `/api/payment/config` | Obtener configuración de PayPal |

---

## Planes de Suscripción

### Plan Free
```json
{
  "planId": "FREE",
  "name": "Free",
  "price": 0,
  "currency": "USD",
  "features": [
    "Hasta 15 items",
    "Archivos hasta 3MB"
  ]
}
```

### Plan VIP Monthly
```json
{
  "planId": "VIP_MONTHLY",
  "name": "VIP Mensual",
  "price": 4.99,
  "currency": "USD",
  "billingPeriod": "month",
  "features": [
    "Items ilimitados",
    "Archivos ilimitados",
    "Sincronización cloud",
    "Soporte prioritario"
  ]
}
```

### Plan VIP Yearly
```json
{
  "planId": "VIP_YEARLY",
  "name": "VIP Anual",
  "price": 39.99,
  "currency": "USD",
  "billingPeriod": "year",
  "features": [
    "Items ilimitados",
    "Archivos ilimitados",
    "Sincronización cloud",
    "Soporte prioritario",
    "2 meses gratis"
  ]
}
```

---

## Estados de Suscripción

| Estado | Descripción |
|--------|-------------|
| `trial` | Usuario en período de prueba |
| `active` | Suscripción activa |
| `expired` | Suscripción expirada |
| `cancelled` | Suscripción cancelada |

---

## Flujo de Activación de Suscripción

```
1. Usuario selecciona plan en PricingPage
2. Redirección a PayPal checkout
3. PayPal approve → paymentId
4. POST /api/payment/activate-subscription
   ↓ { planId, paymentId }
5. Backend verifica con PayPal API
6. Actualizar user.is_vip = true
7. Actualizar user.subscription_status = 'active'
8. Guardar trial/period dates
```

---

## Modelo de Usuario (campos de suscripción)

```javascript
{
  is_vip: BOOLEAN (default: false),
  subscription_status: STRING,  // 'active', 'trial', 'expired', 'cancelled'
  trial_started_at: DATE,
  trial_ends_at: DATE,
  current_period_started_at: DATE,
  current_period_ends_at: DATE,
  auto_renew: BOOLEAN (default: true)
}
```

---

## API Contracts

### POST /api/payment/get-plan

**Request:**
```json
{
  "planId": "VIP_MONTHLY",
  "currency": "USD"
}
```

**Response (200):**
```json
{
  "plan": {
    "id": "VIP_MONTHLY",
    "name": "VIP Mensual",
    "price": 4.99,
    "currency": "USD",
    "description": "Plan mensual VIP"
  },
  "paypalOrderId": "ORDER-123"
}
```

### POST /api/payment/activate-subscription

**Request:**
```json
{
  "planId": "VIP_MONTHLY",
  "paymentId": "PAY-1234567890"
}
```

**Response (200):**
```json
{
  "message": "Suscripción activada",
  "user": {
    "is_vip": true,
    "subscription_status": "active",
    "current_period_ends_at": "2026-05-23T10:00:00Z"
  }
}
```

### GET /api/payment/config

**Request:**
```http
GET /api/payment/config
```

**Response (200):**
```json
{
  "paypalClientId": "...",
  "currency": "USD"
}
```

---

## Errores Comunes

| Código | Mensaje |
|--------|---------|
| `400` | "Plan inválido" |
| `401` | "No autenticado" |
| `403` | "Pago no completado" |
| `404` | "Plan no encontrado" |
| `500` | "Error al procesar pago" |