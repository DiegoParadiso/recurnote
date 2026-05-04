import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'El nombre debe tener entre 2 y 50 caracteres').max(50, 'El nombre debe tener entre 2 y 50 caracteres').regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
    email: z.string().email('El email debe tener un formato válido').max(100, 'El email no puede tener más de 100 caracteres'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128, 'La contraseña no puede tener más de 128 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones')
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('El email debe tener un formato válido'),
    password: z.string().min(1, 'La contraseña es requerida')
  })
});

export const passwordResetSchema = z.object({
  body: z.object({
    email: z.string().email('El email debe tener un formato válido')
  })
});

export const newPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128, 'La contraseña no puede tener más de 128 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial'),
    confirmPassword: z.string(),
    token: z.string().min(1, 'Token requerido')
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
});
