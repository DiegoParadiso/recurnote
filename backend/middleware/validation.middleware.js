import { body, validationResult } from 'express-validator';

// Validación para el registro
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('email')
    .isEmail()
    .withMessage('El email debe tener un formato válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El email no puede tener más de 100 caracteres'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
    .withMessage('Las contraseñas no coinciden'),
  
  body('acceptTerms')
    .isBoolean()
    .custom((value) => {
      if (!value) {
        throw new Error('Debes aceptar los términos y condiciones');
      }
      return true;
    })
    .withMessage('Debes aceptar los términos y condiciones')
];

// Validación para el login
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('El email debe tener un formato válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validación para reset de contraseña
export const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('El email debe tener un formato válido')
    .normalizeEmail()
];

// Validación para nueva contraseña
export const validateNewPassword = [
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
    .withMessage('Las contraseñas no coinciden')
];

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      message: 'Error de validación',
      errors: errorMessages
    });
  }
  next();
};

// Validación para actualización de perfil
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('El email debe tener un formato válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El email no puede tener más de 100 caracteres')
];
