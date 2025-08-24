import nodemailer from 'nodemailer';
import crypto from 'crypto';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Generar token de verificación
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generar token de reset de contraseña
  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Enviar email de verificación
  async sendVerificationEmail(email, name, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"RecurNote" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verifica tu cuenta de RecurNote',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">RecurNote</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Verifica tu cuenta</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Gracias por registrarte en RecurNote. Para completar tu registro y activar tu cuenta, 
              por favor haz clic en el botón de abajo:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Verificar mi cuenta
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              O copia y pega este enlace en tu navegador:
            </p>
            
            <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; color: #495057;">
              ${verificationUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px;">
              Este enlace expirará en 24 horas por seguridad.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Si no solicitaste esta cuenta, puedes ignorar este email.
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 RecurNote. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error enviando email de verificación:', error);
      return false;
    }
  }

  // Enviar email de reset de contraseña
  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"RecurNote" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Restablece tu contraseña de RecurNote',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">RecurNote</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Restablece tu contraseña</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Recibimos una solicitud para restablecer tu contraseña. 
              Si fuiste tú, haz clic en el botón de abajo:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Restablecer contraseña
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              O copia y pega este enlace en tu navegador:
            </p>
            
            <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; color: #495057;">
              ${resetUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px;">
              Este enlace expirará en 1 hora por seguridad.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Si no solicitaste restablecer tu contraseña, puedes ignorar este email.
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 RecurNote. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error enviando email de reset de contraseña:', error);
      return false;
    }
  }

  // Enviar email de bienvenida
  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: `"RecurNote" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '¡Bienvenido a RecurNote!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">RecurNote</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">¡Tu cuenta ha sido verificada!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Bienvenido ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Tu cuenta ha sido verificada exitosamente. Ya puedes comenzar a usar RecurNote 
              para organizar tus notas y tareas de manera eficiente.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Iniciar sesión
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              ¡Disfruta usando RecurNote!
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 RecurNote. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error enviando email de bienvenida:', error);
      return false;
    }
  }
}

export default new EmailService();
