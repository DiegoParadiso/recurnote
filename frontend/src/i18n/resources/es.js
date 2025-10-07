const es = {
  common: {
    config: 'Configuración',
    open_config: 'Abrir configuración',
    close: 'Cerrar panel',
    session: 'Sesión',
    appearance: 'Apariencia',
    visualization: 'Visualización',
    language_region: 'Idioma y región',
    accessibility: 'Accesibilidad',
    notifications: 'Notificaciones',
    privacy: 'Privacidad',
    integrations: 'Integraciones',
    data_management: 'Gestión de Datos',
    dark_mode: 'Modo oscuro',
    light_mode: 'Modo claro',
    auto_theme: 'Modo día/noche automático',
    high_contrast: 'Modo alto contraste',
    large_text: 'Texto grande',
    reduced_motion: 'Animaciones reducidas',
    duplicate: 'Duplicar',
    doubleClickToEdit: 'Doble click para editar...'
  },
  visual: {
    pinLeftSidebar: 'Fijar sidebar izquierdo',
    pinRightSidebar: 'Fijar sidebar derecho',
    accountIndicator: 'Indicador de cuenta',
  },
  language: {
    label: 'Idioma',
    es: 'Español',
    en: 'Inglés',
    auto: 'Auto (SO/Navegador)'
  },
  display: {
    year: 'Año',
    month: 'Mes',
    week: 'Semana',
    weekday: 'Día de la semana',
    day: 'Día',
    time: 'Horario',
  },
  timezone: {
    label: 'Zona horaria',
  },
  timeformat: {
    label: 'Formato de hora',
    h24: '24 horas',
    h12: '12 horas',
  },
  pattern: {
    background: 'Fondo del círculo',
    none: 'Sin fondo',
    pattern1: 'Patrón 1',
    pattern2: 'Patrón 2',
    pattern3: 'Patrón 3',
    pattern4: 'Patrón 4',
    pattern5: 'Patrón 5',
    pattern6: 'Patrón 6',
    pattern7: 'Patrón 7',
    pattern8: 'Patrón 8',
  },
  sidebar: {
    close: 'Cerrar sidebar',
    upcomingDays: 'próximos días',
    empty: 'No hay ítems para los próximos días',
    createFromLeft: 'Crea nuevos ítems desde el sidebar izquierdo',
    deleteItem: 'Eliminar item',
    confirmDeleteItem: '¿Eliminar este ítem?',
    noContent: 'Sin contenido',
    shownFrom: 'Mostrado desde',
  },
  context: {
    delete: 'Eliminar',
    resetPosition: 'Volver a posición original',
    hide: 'Ocultar',
  },
  note: {
    placeholderMobile: 'Escribe tu nota aquí...',
    assignTimeAria: 'Hora a asignar',
    assignTime: 'Asignar horario',
    changeTime: 'Cambiar horario',
    clearTime: 'Quitar horario',
    countdown: {
      in_h_m: 'Faltan {{h}}h {{m}}m',
      in_h: 'Faltan {{h}}h',
      in_m: 'Faltan {{m}} minutos',
      ago_h_m: 'Hace {{h}}h {{m}}m',
      ago_h: 'Hace {{h}}h',
      ago_m: 'Hace {{m}} minutos',
    },
  },
  task: {
    placeholderMobile: 'Tarea...',
    markAllCompleted: 'Marcar todas como completadas',
    empty: 'Tarea sin descripción',
    deleteLast: 'Eliminar última tarea',
  },
  file: {
    rename: 'Renombrar archivo',
    download: 'Descargar archivo',
    expandImage: 'Expandir imagen',
    collapseImage: 'Colapsar imagen',
    renamePrompt: 'Ingrese el nuevo nombre del archivo:',
    duplicateError: 'No se pudo duplicar el archivo',
  },
  session: {
    greet: 'Hola,',
    user: 'Usuario',
    logout: 'Cerrar sesión',
    login: 'Iniciar sesión',
    register: 'Registrarse',
  },
  data: {
    total: 'Total de items',
    past: 'Items pasados',
    mode: 'Modo',
    local: 'Local',
    deletion: 'Eliminación',
    deletePast: 'Eliminar items pasados',
    deleteAll: 'Eliminar todos los items',
    deleting: 'Eliminando...',
    confirmDeletion: 'Confirmar eliminación',
    confirmPastQuestion: '¿Eliminar {{count}} items de días pasados?',
    confirmTotalDeletion: 'Confirmar eliminación total',
    confirmAllQuestion: '¿Eliminar TODOS los {{total}} items?',
    noUndo: 'Esta acción no se puede deshacer',
    localWarning: 'Los items se eliminarán del almacenamiento',
    yesDelete: 'Sí, eliminar',
    yesDeleteAll: 'Sí, eliminar todo',
    cancel: 'Cancelar',
    allDeletedServer: 'Todos los items han sido eliminados del servidor',
    allDeletedLocal: 'Todos los items locales han sido eliminados',
    deleteAllError: 'Error al eliminar todos los items',
    pastDeletedServer: '{{count}} items de días pasados han sido eliminados del servidor',
    pastDeleted: '{{count}} items de días pasados han sido eliminados',
    deletePastError: 'Error al eliminar items de días pasados',
    itemLimit: 'Límite de elementos',
    limitReached: 'Has alcanzado el límite de elementos',
    premiumUnlimited: 'Premium - Sin límite',
    plan: 'Plan',
  },
  auth: {
    loginTitle: 'Iniciar sesión',
    registerTitle: 'Crear cuenta',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Contraseña',
    namePlaceholder: 'Nombre completo',
    confirmPasswordPlaceholder: 'Confirmar contraseña',
    loggingIn: 'Iniciando sesión...',
    loginCta: 'Entrar',
    noAccount: '¿No tenés cuenta?',
    registerLink: 'Registrate',
    forgotPassword: '¿Olvidaste tu contraseña?',
    haveAccount: '¿Ya tenés cuenta?',
    loginLink: 'Iniciá sesión',
    creating: 'Creando cuenta...',
    registerCta: 'Crear cuenta',
    emailRequired: 'El email es requerido',
    emailInvalid: 'El email debe tener un formato válido',
    emailMax: 'El email no puede tener más de 100 caracteres',
    passwordRequired: 'La contraseña es requerida',
    passwordMin: 'La contraseña debe tener al menos 8 caracteres',
    passwordMax: 'La contraseña no puede tener más de 128 caracteres',
    passwordStrength: 'Debe contener minúscula, mayúscula, número y carácter especial',
    nameRequired: 'El nombre es requerido',
    nameMin: 'El nombre debe tener al menos 2 caracteres',
    nameMax: 'El nombre no puede tener más de 50 caracteres',
    nameLetters: 'El nombre solo puede contener letras y espacios',
    confirmPasswordRequired: 'Confirma tu contraseña',
    passwordMismatch: 'Las contraseñas no coinciden',
    termsRequired: 'Debes aceptar los términos y condiciones',
    loginError: 'Error en el login',
    registerError: 'Error en el registro',
    accept: 'Acepto los',
    terms: 'términos y condiciones',
    and: 'y la',
    privacy: 'política de privacidad',
  },
  legal: {
    terms: {
      title: 'Términos y Condiciones',
      lastUpdated: 'Última actualización',
      backToRegister: 'Volver al registro',
      acceptance: {
        title: 'Aceptación de los Términos',
        body: 'Al acceder y utilizar RecurNote, aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro servicio.'
      },
      service: {
        title: 'Descripción del Servicio',
        body: 'RecurNote es una aplicación web que permite crear, organizar y gestionar notas y tareas de manera eficiente, con sincronización, organización por categorías y acceso multiplataforma.'
      },
      account: {
        title: 'Cuenta de Usuario',
        body: 'Para utilizar RecurNote, debes crear una cuenta con información precisa y actualizada. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades de tu cuenta.'
      },
      acceptableUse: {
        title: 'Uso Aceptable',
        body: 'Te comprometes a usar RecurNote solo para fines legales y de acuerdo con estos términos. No debes:',
        items: [
          'Usar el servicio para actividades ilegales o fraudulentas',
          'Intentar acceder a cuentas de otros usuarios',
          'Interferir con el funcionamiento del servicio',
          'Compartir contenido inapropiado u ofensivo'
        ]
      },
      privacy: {
        title: 'Privacidad y Datos',
        body: 'Tu privacidad es importante. El uso de tu información personal se rige por nuestra Política de Privacidad, que es parte de estos términos.'
      },
      ip: {
        title: 'Propiedad Intelectual',
        body: 'RecurNote y su contenido (texto, gráficos, logos, iconos, software) son propiedad de RecurNote o sus licenciantes y están protegidos por leyes de propiedad intelectual.'
      },
      liability: {
        title: 'Limitación de Responsabilidad',
        body: 'RecurNote no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de usar el servicio.'
      },
      changes: {
        title: 'Modificaciones',
        body: 'Podemos modificar estos términos en cualquier momento. Los cambios rigen desde su publicación. Notificaremos cambios significativos por email.'
      },
      termination: {
        title: 'Terminación',
        body: 'Podemos terminar o suspender tu cuenta en cualquier momento, con o sin causa y con o sin aviso. Puedes cancelar tu cuenta cuando quieras.'
      },
      governingLaw: {
        title: 'Ley Aplicable',
        body: 'Estos términos se rigen por las leyes de Argentina. Las disputas se resolverán en tribunales competentes de Argentina.'
      },
      contact: {
        title: 'Contacto',
        body: 'Si tienes preguntas sobre estos términos, contáctanos a través de:',
        email: 'Email: legal@recurnote.com',
        form: 'Formulario de contacto en la aplicación'
      }
    }
  },
  help: {
    session: 'Gestiona opciones de tu sesión (iniciar, cerrar, etc).',
    appearance: 'Cambia temas, colores y fondos.',
    visualization: 'Elige qué elementos de tiempo y vista mostrar.',
    language_region: 'Selecciona idioma, zona horaria y formato de hora.',
    accessibility: 'Ajusta para mayor legibilidad y menos movimiento.',
    data_management: 'Gestiona datos guardados, borrado y reseteo.',
  },
  alerts: {
    selectDayFirst: 'Para agregar un item, primero selecciona un día en el calendario',
    itemDeleted: 'Item eliminado correctamente',
    itemDeleteError: 'Error al eliminar el item',
    selectDayFirstShort: 'Seleccioná un día primero',
    itemCreateError: 'No se pudo crear el item',
  }
};

export default es;


