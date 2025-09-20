const en = {
  common: {
    config: 'Settings',
    open_config: 'Open settings',
    close: 'Close panel',
    session: 'Session',
    appearance: 'Appearance',
    visualization: 'Display',
    language_region: 'Language & region',
    accessibility: 'Accessibility',
    notifications: 'Notifications',
    privacy: 'Privacy',
    integrations: 'Integrations',
    data_management: 'Data Management',
    dark_mode: 'Dark mode',
    light_mode: 'Light mode',
    auto_theme: 'Auto day/night mode',
    high_contrast: 'High contrast mode',
    large_text: 'Large text',
    reduced_motion: 'Reduced motion',
    duplicate: 'Duplicate',
    doubleClickToEdit: 'Double click to edit...'
  },
  visual: {
    pinLeftSidebar: 'Pin left sidebar',
    pinRightSidebar: 'Pin right sidebar',
    accountIndicator: 'Account indicator',
  },
  language: {
    label: 'Language',
    es: 'Spanish',
    en: 'English',
    auto: 'Auto (OS/Browser)'
  },
  display: {
    year: 'Year',
    month: 'Month',
    week: 'Week',
    weekday: 'Weekday',
    day: 'Day',
    time: 'Time',
  },
  timezone: {
    label: 'Time zone',
  },
  timeformat: {
    label: 'Time format',
    h24: '24-hour',
    h12: '12-hour',
  },
  pattern: {
    background: 'Circle background',
    none: 'No background',
    pattern1: 'Pattern 1',
    pattern2: 'Pattern 2',
    pattern3: 'Pattern 3',
    pattern4: 'Pattern 4',
    pattern5: 'Pattern 5',
    pattern6: 'Pattern 6',
    pattern7: 'Pattern 7',
    pattern8: 'Pattern 8',
  },
  sidebar: {
    close: 'Close sidebar',
    upcomingDays: 'upcoming days',
    empty: 'No items for the next days',
    createFromLeft: 'Create new items from the left sidebar',
    deleteItem: 'Delete item',
    confirmDeleteItem: 'Delete this item?',
    noContent: 'No content',
    shownFrom: 'Shown from',
  },
  context: {
    delete: 'Delete',
    resetPosition: 'Reset to original position',
    hide: 'Hide',
  },
  note: {
    placeholderMobile: 'Write your note here...',
    assignTimeAria: 'Time to assign',
    assignTime: 'Assign time',
    changeTime: 'Change time',
    clearTime: 'Clear time',
    countdown: {
      in_h_m: 'In {{h}}h {{m}}m',
      in_h: 'In {{h}}h',
      in_m: 'In {{m}} minutes',
      ago_h_m: '{{h}}h {{m}}m ago',
      ago_h: '{{h}}h ago',
      ago_m: '{{m}} minutes ago',
    },
  },
  task: {
    placeholderMobile: 'Task...',
    markAllCompleted: 'Mark all as completed',
    empty: 'Task without description',
    deleteLast: 'Delete last task',
  },
  file: {
    rename: 'Rename file',
    download: 'Download file',
    expandImage: 'Expand image',
    collapseImage: 'Collapse image',
    renamePrompt: 'Enter the new file name:',
    duplicateError: 'Could not duplicate the file',
  },
  session: {
    greet: 'Hi,',
    user: 'User',
    logout: 'Log out',
    login: 'Log in',
    register: 'Register',
  },
  data: {
    total: 'Total items',
    past: 'Past items',
    mode: 'Mode',
    local: 'Local',
    deletion: 'Deletion',
    deletePast: 'Delete past items',
    deleteAll: 'Delete all items',
    deleting: 'Deleting...',
    confirmDeletion: 'Confirm deletion',
    confirmPastQuestion: 'Delete {{count}} past-day items?',
    confirmTotalDeletion: 'Confirm total deletion',
    confirmAllQuestion: 'Delete ALL {{total}} items?',
    noUndo: 'This action cannot be undone',
    localWarning: 'Items will be removed from storage',
    yesDelete: 'Yes, delete',
    yesDeleteAll: 'Yes, delete all',
    cancel: 'Cancel',
    allDeletedServer: 'All items were deleted from server',
    allDeletedLocal: 'All local items were deleted',
    deleteAllError: 'Error deleting all items',
    pastDeletedServer: '{{count}} past-day items were deleted from server',
    pastDeleted: '{{count}} past-day items were deleted',
    deletePastError: 'Error deleting past-day items',
  },
  auth: {
    loginTitle: 'Log in',
    registerTitle: 'Create account',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    namePlaceholder: 'Full name',
    confirmPasswordPlaceholder: 'Confirm password',
    loggingIn: 'Logging in...',
    loginCta: 'Enter',
    noAccount: "Don't have an account?",
    registerLink: 'Sign up',
    forgotPassword: 'Forgot your password?',
    haveAccount: 'Already have an account?',
    loginLink: 'Log in',
    creating: 'Creating account...',
    registerCta: 'Create account',
    emailRequired: 'Email is required',
    emailInvalid: 'Email must be valid',
    emailMax: 'Email cannot exceed 100 characters',
    passwordRequired: 'Password is required',
    passwordMin: 'Password must be at least 8 characters',
    passwordMax: 'Password cannot exceed 128 characters',
    passwordStrength: 'Must include lowercase, uppercase, number and special char',
    nameRequired: 'Name is required',
    nameMin: 'Name must be at least 2 characters',
    nameMax: 'Name cannot exceed 50 characters',
    nameLetters: 'Name can contain only letters and spaces',
    confirmPasswordRequired: 'Confirm your password',
    passwordMismatch: 'Passwords do not match',
    termsRequired: 'You must accept the terms and conditions',
    loginError: 'Login error',
    registerError: 'Registration error',
    accept: 'I accept the',
    terms: 'terms and conditions',
    and: 'and the',
    privacy: 'privacy policy',
  },
  legal: {
    terms: {
      title: 'Terms and Conditions',
      lastUpdated: 'Last updated',
      backToRegister: 'Back to register',
      acceptance: {
        title: 'Acceptance of Terms',
        body: 'By accessing and using RecurNote, you agree to be bound by these terms and conditions. If you disagree with any part of these terms, you must not use our service.'
      },
      service: {
        title: 'Service Description',
        body: 'RecurNote is a web app to create, organize, and manage notes and tasks efficiently, with sync, categorization, and multi-platform access.'
      },
      account: {
        title: 'User Account',
        body: 'To use RecurNote, you must create an account with accurate and up-to-date information. You are responsible for keeping your password confidential and for all activities under your account.'
      },
      acceptableUse: {
        title: 'Acceptable Use',
        body: 'You agree to use RecurNote only for lawful purposes and in accordance with these terms. You must not:',
        items: [
          'Use the service for illegal or fraudulent activities',
          'Attempt to access other users’ accounts',
          'Interfere with the operation of the service',
          'Share inappropriate or offensive content'
        ]
      },
      privacy: {
        title: 'Privacy and Data',
        body: 'Your privacy is important. The use of your personal information is governed by our Privacy Policy, which is part of these terms.'
      },
      ip: {
        title: 'Intellectual Property',
        body: 'RecurNote and all its content (text, graphics, logos, icons, software) are owned by RecurNote or its licensors and protected by intellectual property laws.'
      },
      liability: {
        title: 'Limitation of Liability',
        body: 'RecurNote shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use the service.'
      },
      changes: {
        title: 'Changes',
        body: 'We may modify these terms at any time. Changes take effect upon publication. We will notify significant changes by email.'
      },
      termination: {
        title: 'Termination',
        body: 'We may terminate or suspend your account at any time, with or without cause and with or without notice. You may cancel your account at any time.'
      },
      governingLaw: {
        title: 'Governing Law',
        body: 'These terms are governed by the laws of Argentina. Disputes will be resolved in the competent courts of Argentina.'
      },
      contact: {
        title: 'Contact',
        body: 'If you have questions about these terms, you can contact us via:',
        email: 'Email: legal@recurnote.com',
        form: 'Contact form in the app'
      }
    }
  },
};

export default en;


