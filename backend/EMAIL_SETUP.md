# Configuración del Sistema de Email - RecurNote

## Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del backend con las siguientes variables:

```env
# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recurnote
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Configuración del servidor
PORT=5000
NODE_ENV=development

# Configuración de email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# URL del frontend
FRONTEND_URL=http://localhost:3000

# Configuración de seguridad
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
EMAIL_VERIFICATION_EXPIRES=24h
PASSWORD_RESET_EXPIRES=1h
```

## Configuración de Gmail

### 1. Habilitar Autenticación de 2 Factores
- Ve a tu cuenta de Google
- Activa la verificación en dos pasos

### 2. Generar Contraseña de Aplicación
- Ve a "Seguridad" > "Contraseñas de aplicación"
- Selecciona "Otra (nombre personalizado)"
- Ingresa "RecurNote" como nombre
- Copia la contraseña generada (16 caracteres)
- Usa esta contraseña en `SMTP_PASS`

### 3. Configuración SMTP
- **Host**: smtp.gmail.com
- **Puerto**: 587
- **Seguridad**: STARTTLS
- **Usuario**: tu_email@gmail.com
- **Contraseña**: contraseña de aplicación generada

## Dependencias Requeridas

Instala las siguientes dependencias:

```bash
npm install nodemailer express-validator
```

## Funcionalidades Implementadas

### 1. Registro con Verificación de Email
- Validación de parámetros en tiempo real
- Generación de token de verificación
- Envío de email de verificación
- Estado de cuenta pendiente hasta verificación

### 2. Verificación de Email
- Endpoint para verificar email con token
- Activación automática de cuenta
- Envío de email de bienvenida

### 3. Reenvío de Email de Verificación
- Endpoint para solicitar nuevo email
- Generación de nuevo token
- Validación de estado de cuenta

### 4. Reset de Contraseña
- Solicitud de reset por email
- Generación de token temporal
- Validación de token y nueva contraseña

### 5. Validaciones
- Nombre: 2-50 caracteres, solo letras y espacios
- Email: formato válido, máximo 100 caracteres
- Contraseña: 8-128 caracteres, requisitos de seguridad
- Confirmación de contraseña
- Aceptación de términos y condiciones

## Estructura de Emails

### Email de Verificación
- Diseño responsivo con gradientes
- Botón de verificación prominente
- Enlace alternativo
- Información de expiración
- Branding de RecurNote

### Email de Reset de Contraseña
- Diseño similar al de verificación
- Botón de reset de contraseña
- Enlace alternativo
- Información de expiración (1 hora)

### Email de Bienvenida
- Confirmación de verificación exitosa
- Botón para iniciar sesión
- Mensaje de bienvenida personalizado

## Seguridad

### Tokens
- **Verificación de email**: 24 horas
- **Reset de contraseña**: 1 hora
- Generación con crypto.randomBytes(32)
- Limpieza automática después de uso

### Contraseñas
- Hash con bcrypt (12 rounds)
- Requisitos mínimos de seguridad
- Validación en frontend y backend

### Validaciones
- Sanitización de inputs
- Validación de formato de email
- Verificación de longitud y caracteres
- Prevención de inyección SQL

## Flujo de Usuario

1. **Registro**
   - Usuario completa formulario
   - Validaciones en tiempo real
   - Envío de email de verificación
   - Estado: pendiente

2. **Verificación**
   - Usuario hace clic en enlace del email
   - Cuenta se activa automáticamente
   - Envío de email de bienvenida
   - Estado: activo

3. **Login**
   - Solo cuentas verificadas pueden acceder
   - JWT válido por 24 horas
   - Actualización de último login

## Manejo de Errores

### Frontend
- Validaciones en tiempo real
- Mensajes de error específicos por campo
- Indicador de fortaleza de contraseña
- Toast notifications para errores generales

### Backend
- Validación de parámetros con express-validator
- Manejo de errores estructurado
- Logs detallados para debugging
- Respuestas consistentes con códigos HTTP apropiados

## Testing

### Endpoints a Probar
- `POST /api/auth/register` - Registro
- `POST /api/auth/verify-email/:token` - Verificación
- `POST /api/auth/resend-verification` - Reenvío
- `POST /api/auth/login` - Login
- `POST /api/auth/request-password-reset` - Solicitud de reset
- `POST /api/auth/reset-password` - Reset de contraseña

### Casos de Prueba
- Registro con datos válidos
- Validación de campos requeridos
- Verificación de formato de email
- Fortaleza de contraseña
- Verificación de email
- Login con cuenta no verificada
- Reset de contraseña
- Manejo de tokens expirados

## Troubleshooting

### Email no se envía
- Verificar configuración SMTP
- Revisar contraseña de aplicación
- Verificar firewall/antivirus
- Revisar logs del servidor

### Token inválido
- Verificar expiración
- Revisar generación de token
- Verificar almacenamiento en base de datos

### Validaciones fallan
- Verificar middleware de validación
- Revisar reglas de validación
- Verificar formato de datos enviados
