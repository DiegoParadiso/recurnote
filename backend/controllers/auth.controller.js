import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import emailService from '../services/email.service.js';

export async function register(req, res) {
  try {
    const { name, email, password, confirmPassword, acceptTerms } = req.body;

    // Validaciones adicionales del servidor
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos',
        errors: ['Todos los campos son requeridos']
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: 'Las contraseñas no coinciden',
        errors: ['Las contraseñas no coinciden']
      });
    }

    if (!acceptTerms) {
      return res.status(400).json({ 
        message: 'Debes aceptar los términos y condiciones',
        errors: ['Debes aceptar los términos y condiciones']
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ 
        message: 'El email ya está registrado',
        errors: ['El email ya está registrado']
      });
    }

    // Generar token de verificación
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario con estado pendiente
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      preferences: {},
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires
    });

    // Enviar email de verificación
    const emailSent = await emailService.sendVerificationEmail(email, name, verificationToken);
    
    // Si no se puede enviar email, activar la cuenta directamente (modo desarrollo)
    if (!emailSent) {
      console.warn('⚠️  No se pudo enviar email de verificación. Activando cuenta directamente...');
      
      // Activar cuenta directamente
      await user.update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      });

      res.status(201).json({ 
        message: 'Usuario registrado correctamente. Cuenta activada automáticamente (modo desarrollo).',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: true
        }
      });
      return;
    }

    res.status(201).json({ 
      message: 'Usuario registrado correctamente. Revisa tu email para verificar tu cuenta.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified
      }
    });

  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ 
      message: 'Error al registrar usuario', 
      errors: ['Error interno del servidor']
    });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        message: 'Token de verificación requerido',
        errors: ['Token de verificación requerido']
      });
    }

    // Buscar usuario con el token
    const user = await User.findOne({ 
      where: { 
        email_verification_token: token,
        account_status: 'pending'
      } 
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Token de verificación inválido o expirado',
        errors: ['Token de verificación inválido o expirado']
      });
    }

    // Verificar si el token no ha expirado
    if (new Date() > user.email_verification_expires) {
      return res.status(400).json({ 
        message: 'Token de verificación expirado',
        errors: ['Token de verificación expirado']
      });
    }

    // Activar cuenta
    await user.update({
      email_verified: true,
      email_verification_token: null,
      email_verification_expires: null,
      account_status: 'active'
    });

    // Enviar email de bienvenida
    await emailService.sendWelcomeEmail(user.email, user.name);

    res.json({ 
      message: 'Email verificado correctamente. Tu cuenta ha sido activada.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        account_status: user.account_status
      }
    });

  } catch (err) {
    console.error('Error en verificación de email:', err);
    res.status(500).json({ 
      message: 'Error al verificar email', 
      errors: ['Error interno del servidor']
    });
  }
}

export async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email requerido',
        errors: ['Email requerido']
      });
    }

    // Buscar usuario
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado',
        errors: ['Usuario no encontrado']
      });
    }

    if (user.email_verified) {
      return res.status(400).json({ 
        message: 'El email ya está verificado',
        errors: ['El email ya está verificado']
      });
    }

    // Generar nuevo token
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Actualizar token
    await user.update({
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires
    });

    // Enviar nuevo email
    const emailSent = await emailService.sendVerificationEmail(email, user.name, verificationToken);
    
    if (!emailSent) {
      return res.status(500).json({ 
        message: 'Error al enviar email de verificación',
        errors: ['Error al enviar email de verificación']
      });
    }

    res.json({ 
      message: 'Email de verificación reenviado correctamente'
    });

  } catch (err) {
    console.error('Error al reenviar email de verificación:', err);
    res.status(500).json({ 
      message: 'Error al reenviar email de verificación', 
      errors: ['Error interno del servidor']
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas',
        errors: ['Credenciales inválidas']
      });
    }

    // Verificar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas',
        errors: ['Credenciales inválidas']
      });
    }

    // Verificar si la cuenta está activa
    if (!user.email_verified) {
      return res.status(403).json({ 
        message: 'Tu cuenta no ha sido verificada. Revisa tu email o solicita un nuevo enlace de verificación.',
        errors: ['Cuenta no verificada'],
        requiresVerification: true
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        email_verified: user.email_verified
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        is_vip: !!user.is_vip, 
        preferences: user.preferences || {},
        email_verified: user.email_verified
      },
      token,
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ 
      message: 'Error al iniciar sesión', 
      errors: ['Error interno del servidor']
    });
  }
}

export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.json({ 
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
      });
    }

    // Generar token de reset
    const resetToken = emailService.generatePasswordResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Actualizar usuario
    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: resetExpires
    });

    // Enviar email
    const emailSent = await emailService.sendPasswordResetEmail(email, user.name, resetToken);
    
    if (!emailSent) {
      return res.status(500).json({ 
        message: 'Error al enviar email de reset',
        errors: ['Error al enviar email de reset']
      });
    }

    res.json({ 
      message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
    });

  } catch (err) {
    console.error('Error en solicitud de reset de contraseña:', err);
    res.status(500).json({ 
      message: 'Error al procesar solicitud', 
      errors: ['Error interno del servidor']
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos',
        errors: ['Todos los campos son requeridos']
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: 'Las contraseñas no coinciden',
        errors: ['Las contraseñas no coinciden']
      });
    }

    // Buscar usuario con el token
    const user = await User.findOne({ 
      where: { 
        password_reset_token: token,
        account_status: 'active'
      } 
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Token de reset inválido o expirado',
        errors: ['Token de reset inválido o expirado']
      });
    }

    // Verificar si el token no ha expirado
    if (new Date() > user.password_reset_expires) {
      return res.status(400).json({ 
        message: 'Token de reset expirado',
        errors: ['Token de reset expirado']
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Actualizar contraseña y limpiar token
    await user.update({
      password: hashedPassword,
      password_reset_token: null,
      password_reset_expires: null
    });

    res.json({ 
      message: 'Contraseña restablecida correctamente'
    });

  } catch (err) {
    console.error('Error en reset de contraseña:', err);
    res.status(500).json({ 
      message: 'Error al restablecer contraseña', 
      errors: ['Error interno del servidor']
    });
  }
}

export async function getMe(req, res) {
  try {
    const user = req.user;
    res.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      is_vip: !!user.is_vip, 
      preferences: user.preferences || {},
      email_verified: user.email_verified
    });
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ 
      message: 'Error al obtener usuario', 
      errors: ['Error interno del servidor']
    });
  }
}

export async function updatePreferences(req, res) {
  try {
    const { preferences } = req.body;
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ 
        message: 'Preferencias inválidas',
        errors: ['Preferencias inválidas']
      });
    }
    await req.user.update({ preferences: { ...(req.user.preferences || {}), ...preferences } });
    res.json({ preferences: req.user.preferences || {} });
  } catch (err) {
    console.error('Error al actualizar preferencias:', err);
    res.status(500).json({ 
      message: 'Error al actualizar preferencias', 
      errors: ['Error interno del servidor']
    });
  }
}
