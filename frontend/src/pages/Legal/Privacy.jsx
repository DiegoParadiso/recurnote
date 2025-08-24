import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/legal.css';
import EmptyLogo from '../../components/common/EmptyLogo.jsx';

export default function Privacy() {
  const isSmallScreen = window.innerWidth < 768;

  return (
    <div className="legal-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />
      
      <div className="legal-content" style={{ position: 'relative', zIndex: 'var(--z-base)' }}>
        <div className="legal-header">
          <h1>Política de Privacidad</h1>
          <p className="legal-date">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
        </div>

        <div className="legal-body">
          <section>
            <h2>1. Información que Recopilamos</h2>
            <p>
              Recopilamos la siguiente información cuando utilizas RecurNote:
            </p>
            <ul>
              <li><strong>Información de cuenta:</strong> nombre, email y contraseña</li>
              <li><strong>Datos de uso:</strong> cómo interactúas con la aplicación</li>
              <li><strong>Contenido:</strong> notas, tareas y preferencias que creas</li>
              <li><strong>Información técnica:</strong> tipo de dispositivo, navegador y sistema operativo</li>
            </ul>
          </section>

          <section>
            <h2>2. Cómo Usamos tu Información</h2>
            <p>
              Utilizamos tu información para:
            </p>
            <ul>
              <li>Proporcionar y mantener el servicio de RecurNote</li>
              <li>Personalizar tu experiencia y mostrar contenido relevante</li>
              <li>Comunicarnos contigo sobre actualizaciones y cambios</li>
              <li>Mejorar nuestros servicios y desarrollar nuevas funcionalidades</li>
              <li>Garantizar la seguridad y prevenir fraudes</li>
            </ul>
          </section>

          <section>
            <h2>3. Compartir tu Información</h2>
            <p>
              No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto:
            </p>
            <ul>
              <li>Con tu consentimiento explícito</li>
              <li>Para cumplir con obligaciones legales</li>
              <li>Con proveedores de servicios que nos ayudan a operar (con garantías de privacidad)</li>
              <li>Para proteger nuestros derechos y la seguridad de otros usuarios</li>
            </ul>
          </section>

          <section>
            <h2>4. Seguridad de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
            </p>
            <ul>
              <li>Encriptación de datos en tránsito y en reposo</li>
              <li>Acceso restringido a información personal</li>
              <li>Monitoreo regular de seguridad</li>
              <li>Copias de seguridad seguras</li>
            </ul>
          </section>

          <section>
            <h2>5. Almacenamiento de Datos</h2>
            <p>
              Tus datos se almacenan en servidores seguros ubicados en centros de datos confiables. 
              Retenemos tu información mientras mantengas una cuenta activa o según sea necesario 
              para proporcionar servicios.
            </p>
          </section>

          <section>
            <h2>6. Tus Derechos</h2>
            <p>
              Tienes derecho a:
            </p>
            <ul>
              <li>Acceder a tu información personal</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de tu cuenta</li>
              <li>Exportar tus datos</li>
              <li>Retirar el consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section>
            <h2>7. Cookies y Tecnologías Similares</h2>
            <p>
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul>
              <li>Recordar tus preferencias y configuraciones</li>
              <li>Analizar el uso de la aplicación</li>
              <li>Mejorar la funcionalidad y rendimiento</li>
              <li>Proporcionar contenido personalizado</li>
            </ul>
          </section>

          <section>
            <h2>8. Menores de Edad</h2>
            <p>
              RecurNote no está dirigido a menores de 13 años. No recopilamos intencionalmente 
              información personal de menores de 13 años. Si eres padre o tutor y crees que tu hijo 
              nos ha proporcionado información personal, contáctanos inmediatamente.
            </p>
          </section>

          <section>
            <h2>9. Transferencias Internacionales</h2>
            <p>
              Tu información puede ser transferida y procesada en países diferentes al tuyo. 
              Nos aseguramos de que estas transferencias cumplan con las leyes de protección 
              de datos aplicables.
            </p>
          </section>

          <section>
            <h2>10. Cambios en esta Política</h2>
            <p>
              Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos 
              sobre cambios significativos por email o a través de la aplicación. Te recomendamos 
              revisar esta política regularmente.
            </p>
          </section>

          <section>
            <h2>11. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu información, 
              puedes contactarnos a través de:
            </p>
            <ul>
              <li>Email: privacy@recurnote.com</li>
              <li>Formulario de contacto en la aplicación</li>
              <li>Dirección postal: [Dirección de la empresa]</li>
            </ul>
          </section>
        </div>

        <div className="legal-footer">
          <Link to="/register" className="back-button">
            ← Volver al registro
          </Link>
        </div>
      </div>
    </div>
  );
}
