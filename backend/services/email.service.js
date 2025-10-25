// emailService.js
import { Resend } from 'resend';
import crypto from 'crypto';

class EmailService {
  constructor() {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY no configurada. Los emails no se enviarán.');
        this.client = null;
        return;
      }

      this.client = new Resend(process.env.RESEND_API_KEY);
      console.log('EmailService inicializado con Resend');
    } catch (error) {
      console.error('Error al inicializar EmailService:', error);
      this.client = null;
    }
  }

  // --- Métodos utilitarios ---
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // --- Método genérico para enviar email ---
  async sendEmail(mailOptions) {
    if (!this.client) {
      console.warn('⚠️  No se puede enviar email: Resend no configurado');
      return false;
    }

    try {
      const data = await this.client.emails.send({
        from: `"RecurNote" <onboarding@resend.dev>`, // O tu dominio verificado
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html
      });

      console.log('📨 Email enviado exitosamente:', data);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }

  // --- Email de código de verificación ---
  async sendVerificationCodeEmail(email, name, code) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">RecurNote</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Verifica tu cuenta</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${name}!</h2>
          <p style="color: #666;">Gracias por registrarte. Tu código de verificación es:</p>
          <div style="border: 2px dashed #667eea; padding: 20px; border-radius: 8px; text-align: center;">
            <h1 style="color: #667eea; font-size: 48px; letter-spacing: 10px;">${code}</h1>
          </div>
          <p style="color: #666;">Este código expirará en <strong>10 minutos</strong>.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Código de verificación - RecurNote',
      html
    });
  }

  // --- Email de verificación con token (enlace) ---
  async sendVerificationEmail(email, name, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px; text-align: center; color: white;">
          <h1>RecurNote</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>¡Hola ${name}!</h2>
          <p>Haz clic para verificar tu cuenta:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 12px 25px;
               border-radius: 20px; text-decoration: none;">Verificar cuenta</a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verifica tu cuenta de RecurNote',
      html
    });
  }

  // --- Email de reset de contraseña ---
  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px; text-align: center; color: white;">
          <h1>RecurNote</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Restablece tu contraseña</h2>
          <p>Haz clic en el siguiente botón para cambiar tu contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 25px;
               border-radius: 20px; text-decoration: none;">Restablecer contraseña</a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Restablece tu contraseña - Recurnote',
      html
    });
  }

  // --- Email de bienvenida ---
  async sendWelcomeEmail(email, name) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px; text-align: center; color: white;">
          <h1>RecurNote</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>¡Bienvenido ${name}!</h2>
          <p>Tu cuenta ha sido verificada exitosamente. ¡Ya puedes comenzar a usar RecurNote!</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: '¡Bienvenido a RecurNote!',
      html
    });
  }
}

export default new EmailService();
