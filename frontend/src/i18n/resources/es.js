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
    doubleClickToEdit: 'Doble click para editar...',
    loading: 'Cargando...',
    comingSoon: 'Próximamente',
    cancel: 'Cancelar',
    delete: 'Eliminar'
  },
  visual: {
    pinLeftSidebar: 'Fijar sidebar izquierdo',
    pinRightSidebar: 'Fijar sidebar derecho',
    accountIndicator: 'Indicador de cuenta',
    fullboardMode: 'Modo Libre',
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
    hide: 'Ocultar Sidebar',
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
    passwordStrength: 'Debe contener minúscula, mayúscula y número',
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
    loginWithGitHub: 'Iniciar sesión con GitHub',
    loginWithGmail: 'Iniciar sesión con Gmail',
  loginWithGoogle: 'Iniciar sesión con Google',
  continueWith: 'O continúa con',
    githubAuthError: 'No se pudo iniciar sesión con GitHub. Intenta de nuevo.',
    gmailAuthError: 'No se pudo iniciar sesión con Gmail. Intenta de nuevo.',
  googleAuthError: 'No se pudo iniciar sesión con Google. Intenta de nuevo.',
    invalidCredentials: 'Email o contraseña inválidos',
    emailNotVerified: 'Tu email no ha sido verificado. Revisa tu bandeja de entrada para el código o enlace de verificación.',
    pwStrength: {
      weak: 'Débil',
      fair: 'Regular',
      good: 'Buena',
      excellent: 'Excelente'
    },
    pwReqs: {
      length: 'Mínimo 8 caracteres',
      lowercase: 'Una minúscula',
      uppercase: 'Una mayúscula',
      number: 'Un número'
    },
  },
  forgot: {
    title: '¿Olvidaste tu contraseña?',
    subtitle: 'Ingresá tu email y te enviaremos instrucciones para restablecerla.',
    sending: 'Enviando...',
    sendCta: 'Enviar instrucciones',
    sentInfo: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña en breve.',
    errorGeneric: 'No se pudo procesar la solicitud',
    backToLogin: 'Volver a iniciar sesión'
  },
  reset: {
    title: 'Creá una nueva contraseña',
    subtitle: 'Ingresá y confirmá tu nueva contraseña para recuperar el acceso.',
    saving: 'Guardando...',
    saveCta: 'Guardar nueva contraseña',
    success: 'Contraseña cambiada correctamente. Redirigiendo...',
    errorGeneric: 'No se pudo restablecer la contraseña',
    invalidLink: 'Enlace inválido o expirado'
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
        body: 'Si tienes preguntas sobre estos términos, contáctanos a través del email: recurnote@gmail.com',
      }
    },
    privacy: {
      title: 'Política de Privacidad',
      lastUpdated: 'Última actualización',
      backToRegister: 'Volver al registro',
      infoCollected: {
        title: 'Información que Recopilamos',
        body: 'Recopilamos la siguiente información cuando utilizas RecurNote:',
        items: [
          { label: 'Información de cuenta:', value: 'nombre, email y contraseña' },
          { label: 'Datos de uso:', value: 'cómo interactúas con la aplicación' },
          { label: 'Contenido:', value: 'notas, tareas y preferencias que creas' },
          { label: 'Información técnica:', value: 'tipo de dispositivo, navegador y sistema operativo' }
        ]
      },
      howWeUse: {
        title: 'Cómo Usamos tu Información',
        body: 'Utilizamos tu información para:',
        items: [
          'Proporcionar y mantener el servicio de RecurNote',
          'Personalizar tu experiencia y mostrar contenido relevante',
          'Comunicarnos contigo sobre actualizaciones y cambios',
          'Mejorar nuestros servicios y desarrollar nuevas funcionalidades',
          'Garantizar la seguridad y prevenir fraudes'
        ]
      },
      sharing: {
        title: 'Compartir tu Información',
        body: 'No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto:',
        items: [
          'Con tu consentimiento explícito',
          'Para cumplir con obligaciones legales',
          'Con proveedores de servicios que nos ayudan a operar (con garantías de privacidad)',
          'Para proteger nuestros derechos y la seguridad de otros usuarios'
        ]
      },
      dataSecurity: {
        title: 'Seguridad de Datos',
        body: 'Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:',
        items: [
          'Encriptación de datos en tránsito y en reposo',
          'Acceso restringido a información personal',
          'Monitoreo regular de seguridad',
          'Copias de seguridad seguras'
        ]
      },
      dataStorage: {
        title: 'Almacenamiento de Datos',
        body: 'Tus datos se almacenan en servidores seguros ubicados en centros de datos confiables. Retenemos tu información mientras mantengas una cuenta activa o según sea necesario para proporcionar servicios.'
      },
      yourRights: {
        title: 'Tus Derechos',
        body: 'Tienes derecho a:',
        items: [
          'Acceder a tu información personal',
          'Corregir información inexacta',
          'Solicitar la eliminación de tu cuenta',
          'Exportar tus datos',
          'Retirar el consentimiento en cualquier momento'
        ]
      },
      cookies: {
        title: 'Cookies y Tecnologías Similares',
        body: 'Utilizamos cookies y tecnologías similares para:',
        items: [
          'Recordar tus preferencias y configuraciones',
          'Analizar el uso de la aplicación',
          'Mejorar la funcionalidad y rendimiento',
          'Proporcionar contenido personalizado'
        ]
      },
      minors: {
        title: 'Menores de Edad',
        body: 'RecurNote no está dirigido a menores de 13 años. No recopilamos intencionalmente información personal de menores de 13 años. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información personal, contáctanos inmediatamente.'
      },
      international: {
        title: 'Transferencias Internacionales',
        body: 'Tu información puede ser transferida y procesada en países diferentes al tuyo. Nos aseguramos de que estas transferencias cumplan con las leyes de protección de datos aplicables.'
      },
      changes: {
        title: 'Cambios en esta Política',
        body: 'Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios significativos por email o a través de la aplicación. Te recomendamos revisar esta política regularmente.'
      },
      contact: {
        title: 'Contacto',
        body: 'Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu información, puedes contactarnos a través de: recurnote@gmail.com',
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
    fileTooLarge: 'El archivo excede el límite de {{max}} MB',
    localLimitReached: 'Límite alcanzado. Solo puedes tener {{max}} items en modo local.',
    confirmDelete: '¿Eliminar este ítem?',
    confirmDeleteMessage: 'Esta acción no se puede deshacer.',
  },
  account: {
    modePremium: 'Modo Premium',
    modeUser: 'Modo Usuario',
    modeLocal: 'Modo Local',
    remaining: '{{count}} elementos'
  },
  notFound: {
    title: 'Página no encontrada',
    message: 'Lo sentimos, la página que buscas no existe',
    backHome: 'Volver al inicio'
  },
  onExitSyncWarn: "Hay datos sin sincronizar. Si sales ahora, se perderán los cambios que no se hayan guardado en la nube. ¿Seguro que deseas salir?",
};

export default es;
