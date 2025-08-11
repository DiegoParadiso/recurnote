# Recurnote Frontend - Estructura del Proyecto

## 🏗️ **Arquitectura Refactorizada**

### **Estructura de Carpetas**

```
src/
├── components/
│   ├── ui/           # Componentes de UI reutilizables
│   ├── layout/       # Componentes de layout (sidebars, etc.)
│   ├── features/     # Componentes específicos de funcionalidad
│   └── common/       # Componentes comunes (mantener)
├── hooks/            # Hooks personalizados
├── context/          # Contextos de React
├── utils/
│   ├── constants/    # Constantes organizadas por dominio
│   ├── helpers/      # Funciones helper
│   └── validators/   # Validaciones
├── styles/
│   ├── components/   # Estilos específicos de componentes
│   ├── layouts/      # Estilos de layout
│   └── themes/       # Temas y variables CSS
├── types/            # Definiciones de tipos (para futuro TypeScript)
└── pages/            # Páginas de la aplicación
```

### **🎯 Principios de Diseño**

1. **Separación de Responsabilidades**: Lógica de negocio en hooks, UI en componentes
2. **Reutilización**: Hooks y utilidades compartidas entre componentes
3. **Mantenibilidad**: Código modular y fácil de entender
4. **Escalabilidad**: Estructura preparada para crecimiento futuro

### **📁 Organización de Constantes**

- **`utils/constants/layout.js`**: Constantes de layout y sidebars
- **`utils/constants/zIndex.js`**: Constantes de z-index
- **`utils/constants/theme.js`**: Constantes de tema
- **`utils/constants/index.js`**: Exporta todas las constantes

### **🔧 Hooks Personalizados**

- **`useHomeLogic`**: Lógica de negocio de la página Home
- **`useCircleLargeLogic`**: Lógica de negocio del CircleLarge
- **`useDisplayText`**: Formateo de texto de fondo

### **📝 Beneficios de la Refactorización**

1. **Home.jsx**: Reducido de 403 a ~200 líneas
2. **CircleLarge.jsx**: Reducido de 318 a ~150 líneas
3. **Código reutilizable**: Hooks compartidos entre componentes
4. **Mantenimiento**: Cambios centralizados en un lugar
5. **Testing**: Lógica de negocio fácil de testear
6. **TypeScript**: Preparado para migración futura

### **🚀 Próximos Pasos Recomendados**

1. **Migrar a TypeScript**: Usar tipos definidos en `types/`
2. **Testing**: Agregar tests para hooks y utilidades
3. **Storybook**: Documentar componentes UI
4. **Performance**: Implementar React.memo y useMemo donde sea necesario
5. **Error Boundaries**: Agregar manejo de errores robusto
