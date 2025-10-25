import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import emailService from '../services/email.service.js';

export async function register(req, res) {
  try {
    const { name, email, password, confirmPassword, acceptTerms } = req.body;

    // Validaciones
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

    // Generar código de verificación
    const verificationCode = emailService.generateVerificationCode();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      preferences: {},
      email_verified: false,
      verification_code: verificationCode,
      verification_code_expires: codeExpiresAt
    });

    // ✅ RESPONDER INMEDIATAMENTE
    res.status(201).json({ 
      message: 'Usuario registrado. Revisa tu email para el código de verificación.',
      userId: user.id
    });

    // 🔥 ENVIAR EMAIL EN SEGUNDO PLANO (sin await)
    emailService.sendVerificationCodeEmail(email, name, verificationCode)
      .then(success => {
        if (success) {
          console.log('✅ Email de verificación enviado a', email);
        } else {
          console.warn('⚠️  No se pudo enviar email a', email);
        }
      })
      .catch(err => {
        console.error('❌ Error enviando email:', err);
      });

  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ 
      message: 'Error al registrar usuario', 
      errors: ['Error interno del servidor']
    });
  }
}

export async function verifyCode(req, res) {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ 
        message: 'Faltan datos de verificación',
        errors: ['Proporciona el código de verificación']
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado',
        errors: ['Usuario no encontrado']
      });
    }

    if (user.email_verified) {
      return res.status(400).json({ 
        message: 'Este usuario ya está verificado',
        errors: ['Ya estás verificado']
      });
    }

    if (user.verification_code !== code) {
      return res.status(400).json({ 
        message: 'Código inválido',
        errors: ['El código ingresado es incorrecto']
      });
    }

    if (new Date() > user.verification_code_expires) {
      return res.status(400).json({ 
        message: 'El código ha expirado',
        errors: ['Solicita un nuevo código']
      });
    }

    await user.update({
      email_verified: true,
      verification_code: null,
      verification_code_expires: null
    });

    // Enviar email de bienvenida en segundo plano
    emailService.sendWelcomeEmail(user.email, user.name)
      .then(() => console.log('✅ Email de bienvenida enviado'))
      .catch(err => console.error('❌ Error email bienvenida:', err));

    res.json({ 
      message: 'Cuenta verificada exitosamente'
    });

  } catch (err) {
    console.error('Error en verificación:', err);
    res.status(500).json({ 
      message: 'Error al verificar código', 
      errors: ['Error interno del servidor']
    });
  }
}

export async function resendCode(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        message: 'Falta ID de usuario',
        errors: ['ID de usuario requerido']
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado',
        errors: ['Usuario no encontrado']
      });
    }

    if (user.email_verified) {
      return res.status(400).json({ 
        message: 'Este usuario ya está verificado',
        errors: ['Ya estás verificado']
      });
    }

    // Generar nuevo código
    const verificationCode = emailService.generateVerificationCode();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({
      verification_code: verificationCode,
      verification_code_expires: codeExpiresAt
    });

    // ✅ RESPONDER INMEDIATAMENTE
    res.json({ 
      message: 'Código reenviado exitosamente'
    });

    // 🔥 ENVIAR EMAIL EN SEGUNDO PLANO
    emailService.sendVerificationCodeEmail(user.email, user.name, verificationCode)
      .then(success => {
        if (success) {
          console.log('✅ Código reenviado a', user.email);
        } else {
          console.warn('⚠️  No se pudo reenviar código');
        }
      })
      .catch(err => console.error('❌ Error reenviando código:', err));

  } catch (err) {
    console.error('Error al reenviar código:', err);
    res.status(500).json({ 
      message: 'Error al reenviar código', 
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

    const user = await User.findOne({ 
      where: { 
        email_verification_token: token
      } 
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Token de verificación inválido o expirado',
        errors: ['Token de verificación inválido o expirado']
      });
    }

    if (new Date() > user.email_verification_expires) {
      return res.status(400).json({ 
        message: 'Token de verificación expirado',
        errors: ['Token de verificación expirado']
      });
    }

    await user.update({
      email_verified: true,
      email_verification_token: null,
      email_verification_expires: null
    });

    emailService.sendWelcomeEmail(user.email, user.name)
      .catch(err => console.error('Error email bienvenida:', err));

    res.json({ 
      message: 'Email verificado correctamente. Tu cuenta ha sido activada.'
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

    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.update({
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires
    });

    res.json({ 
      message: 'Email de verificación reenviado correctamente'
    });

    emailService.sendVerificationEmail(email, user.name, verificationToken)
      .catch(err => console.error('Error reenviando email:', err));

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

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas',
        errors: ['Credenciales inválidas']
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas',
        errors: ['Credenciales inválidas']
      });
    }

    if (!user.email_verified) {
      return res.status(403).json({ 
        message: 'Tu cuenta no ha sido verificada. Revisa tu email.',
        errors: ['Cuenta no verificada'],
        requiresVerification: true,
        userId: user.id
      });
    }

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

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ 
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
      });
    }

    const resetToken = emailService.generatePasswordResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: resetExpires
    });

    res.json({ 
      message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
    });

    emailService.sendPasswordResetEmail(email, user.name, resetToken)
      .catch(err => console.error('Error email reset:', err));

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

    const user = await User.findOne({ 
      where: { 
        password_reset_token: token
      } 
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Token de reset inválido o expirado',
        errors: ['Token de reset inválido o expirado']
      });
    }

    if (new Date() > user.password_reset_expires) {
      return res.status(400).json({ 
        message: 'Token de reset expirado',
        errors: ['Token de reset expirado']
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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