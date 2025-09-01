# Recurnote

> **Una aplicación innovadora de gestión de notas y tareas con interfaz circular**

Recurnote revoluciona la forma de organizar tu día a día mediante una interfaz circular intuitiva que permite gestionar tareas, notas y archivos de manera visual y espacial.

## Características Principales

### Interfaz Circular Innovadora
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
- **8 patrones de fondo** para personalizar el círculo
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

## 🗄️ Modelo de Datos

### Usuarios
```sql
Users {
  id: INTEGER PRIMARY KEY
  name: VARCHAR(50)
  email: VARCHAR UNIQUE
  password: VARCHAR(128)     -- bcrypt hash
  is_vip: BOOLEAN
  preferences: JSONB         -- Configuración flexible
  email_verified: BOOLEAN
  timestamps
}
```

### Items
```sql
Items {
  id: INTEGER PRIMARY KEY
  user_id: INTEGER REFERENCES Users(id)
  date: DATE                 -- Día específico
  x, y: NUMERIC(10,2)       -- Posición en círculo
  rotation: NUMERIC(10,2)    -- Rotación del elemento
  item_data: JSONB          -- Contenido flexible
  timestamps
}
```

## Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Configuración del Backend
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de base de datos

# Iniciar servidor de desarrollo
npm run dev
```

### Configuración del Frontend
```bash
cd frontend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de tu backend

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/recurnote
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=5001
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001
```

## Características Técnicas Únicas

### Sistema Drag & Drop Avanzado
- **Touch events** para dispositivos móviles
- **Prevención de selección** de texto durante drag
- **Delegación de eventos** para inputs editables
- **Estados de drag** con timeouts y recovery
- **Drop zones** inteligentes

### Patrones de Fondo Dinámicos
- **8 patrones personalizables** con preview
- **Filtros CSS** para adaptación automática al tema
- **Pseudo-elementos** para aislamiento visual
- **Sistema de z-index** centralizado
- **Opacidad adaptativa** según modo claro/oscuro

### Gestión de Estado Híbrida
- **Context API** para estado global
- **LocalStorage** para persistencia offline
- **Hooks personalizados** para lógica compleja
- **Sincronización bidireccional** automática

## 📱 Responsive Design

### Desktop
- **Interfaz completa** con todas las características
- **Sidebars** para navegación y configuración
- **Drag & drop** con mouse y teclado
- **Patrones de fondo** habilitados

### Mobile
- **UI optimizada** para touch
- **Navegación por gestos** (swipe, tap)
- **Controles adaptados** para pantallas pequeñas
- **Modo simplificado** sin patrones de fondo

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

### Funcionalidades Futuras
- **Colaboración en tiempo real** con WebSockets
- **Integraciones** con Google Calendar, Notion, Slack
- **Inteligencia artificial** para sugerencias
- **Análisis de productividad** con métricas
- **API pública** para desarrolladores

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

## 📦 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy automático con Git integration
```

### Backend (Railway/Heroku)
```bash
# Configurar variables de entorno en plataforma
# Deploy automático desde repositorio
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

### Pull Request Process
1. Fork del repositorio
2. Crear branch feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'feat: agregar nueva característica'`)
4. Push al branch (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

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

