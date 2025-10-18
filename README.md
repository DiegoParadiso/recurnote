# Recurnote
Recurnote organiza tu día a día mediante una interfaz circular intuitiva que permite gestionar tareas, notas y archivos de manera visual y espacial.

## Características Principales

### Interfaz Circular 
- **Navegación temporal** con círculo pequeño para cambiar días/meses
- **Círculo principal** donde se organizan todos los elementos del día
- **Posicionamiento libre** de elementos mediante drag & drop
- **Rotación dinámica** del círculo para mejor organización

### Tipos de Elementos
- **TaskItem**: Listas de tareas con checkboxes interactivos
- **NoteItem**: Notas de texto con redimensionamiento
- **ArchiveItem**: Gestión de archivos con vista previa de imágenes

### Personalización Avanzada
- **Temas claro/oscuro** con cambio automático
- **Patrones de fondo** para personalizar el círculo
- **Configuración granular** de visualización y preferencias
- **Responsive design** optimizado para desktop y móvil

### Sincronización Inteligente
- **Modo offline** con almacenamiento local
- **Sincronización automática** con la nube
- **Migración de datos** local → cloud sin pérdidas
- **Estado híbrido** para máxima disponibilidad

## 🏗️ Arquitectura Técnica

### Frontend Stack
```javascript
React 18.3.1          // Framework principal
Vite 6.3.5            // Build tool y dev server
Tailwind CSS 3.4.17   // Framework CSS utility-first
React Router 7.7.1    // Navegación SPA
Luxon 3.6.1           // Manejo de fechas y zonas horarias
Lucide React 0.525.0  // Iconografía moderna
```

### Backend Stack
```javascript
Node.js + Express 5.1.0  // Servidor API REST
PostgreSQL + Sequelize   // Base de datos y ORM
JWT Authentication       // Autenticación stateless
bcrypt 6.0.0            // Hash de contraseñas
Nodemailer 6.9.7        // Sistema de emails
```

### Arquitectura de Estado
```
AuthContext → ThemeContext → ItemsContext → NotesContext
     ↓              ↓              ↓            ↓
  Usuario        Temas         Items        Navegación
```

## Seguridad

### Autenticación
- **JWT tokens** con validación automática
- **Refresh tokens** para sesiones persistentes
- **Validación de email** obligatoria
- **Hash bcrypt** para contraseñas

### API Security
- **CORS configurado** para dominios específicos
- **Rate limiting** en endpoints críticos
- **Validación de inputs** con express-validator
- **SSL forzado** en producción

## Roadmap de Expansión

### 📱 Aplicación Móvil Nativa
**Tecnología**: React Native + Expo
- Reutilización del 70% del código React existente
- Gestos nativos (swipe, pinch, long press)
- Notificaciones push para recordatorios
- Sincronización en background
- Integración con calendario del sistema

### 🖥️ Aplicación de Escritorio
**Tecnología**: Electron
- Reutilización completa del código web
- Atajos de teclado avanzados
- Integración con sistema operativo
- Múltiples ventanas para diferentes días
- Auto-updater integrado

## Testing

### Frontend
```bash
cd frontend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run lint          # ESLint
```

### Backend
```bash
cd backend
npm run test          # API tests
npm run test:db       # Database tests
```

### Base de Datos
- **Neon PostgreSQL** (recomendado)
- **Supabase** (alternativa)
- **AWS RDS** (producción enterprise)

## Contribución

### Estructura de Commits
```
feat: nueva característica
fix: corrección de bug
docs: documentación
style: formato de código
refactor: refactorización
test: tests
chore: tareas de mantenimiento
```


## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

<div align="center">

**Recurnote - Organiza tu vida de forma circular**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

