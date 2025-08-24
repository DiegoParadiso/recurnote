import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/legal.css';
import EmptyLogo from '../../components/common/EmptyLogo.jsx';

export default function Terms() {
  const isSmallScreen = window.innerWidth < 768;

  return (
    <div className="legal-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />
      
      <div className="legal-content" style={{ position: 'relative', zIndex: 'var(--z-base)' }}>
        <div className="legal-header">
          <h1>Términos y Condiciones</h1>
          <p className="legal-date">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
        </div>

        <div className="legal-body">
          <section>
            <h2>1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar RecurNote, aceptas estar sujeto a estos términos y condiciones. 
              Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro servicio.
            </p>
          </section>

          <section>
            <h2>2. Descripción del Servicio</h2>
            <p>
              RecurNote es una aplicación web que permite a los usuarios crear, organizar y gestionar 
              notas y tareas de manera eficiente. El servicio incluye funcionalidades de sincronización, 
              organización por categorías y acceso multiplataforma.
            </p>
          </section>

          <section>
            <h2>3. Cuenta de Usuario</h2>
            <p>
              Para utilizar RecurNote, debes crear una cuenta proporcionando información precisa y actualizada. 
              Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades 
              que ocurran bajo tu cuenta.
            </p>
          </section>

          <section>
            <h2>4. Uso Aceptable</h2>
            <p>
              Te comprometes a usar RecurNote solo para fines legales y de acuerdo con estos términos. 
              No debes:
            </p>
            <ul>
              <li>Usar el servicio para actividades ilegales o fraudulentas</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Interferir con el funcionamiento del servicio</li>
              <li>Compartir contenido inapropiado o ofensivo</li>
            </ul>
          </section>

          <section>
            <h2>5. Privacidad y Datos</h2>
            <p>
              Tu privacidad es importante para nosotros. El uso de tu información personal se rige por 
              nuestra Política de Privacidad, que forma parte de estos términos.
            </p>
          </section>

          <section>
            <h2>6. Propiedad Intelectual</h2>
            <p>
              RecurNote y todo su contenido, incluyendo pero no limitado a texto, gráficos, logos, 
              iconos y software, son propiedad de RecurNote o sus licenciantes y están protegidos por 
              las leyes de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2>7. Limitación de Responsabilidad</h2>
            <p>
              En ningún caso RecurNote será responsable por daños indirectos, incidentales, especiales 
              o consecuentes que resulten del uso o la imposibilidad de usar el servicio.
            </p>
          </section>

          <section>
            <h2>8. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios 
              entrarán en vigor inmediatamente después de su publicación. Te notificaremos sobre cambios 
              significativos por email.
            </p>
          </section>

          <section>
            <h2>9. Terminación</h2>
            <p>
              Podemos terminar o suspender tu cuenta en cualquier momento, con o sin causa, con o sin 
              previo aviso. También puedes cancelar tu cuenta en cualquier momento.
            </p>
          </section>

          <section>
            <h2>10. Ley Aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de Argentina. Cualquier disputa será resuelta en 
              los tribunales competentes de Argentina.
            </p>
          </section>

          <section>
            <h2>11. Contacto</h2>
            <p>
              Si tienes preguntas sobre estos términos, puedes contactarnos a través de:
            </p>
            <ul>
              <li>Email: legal@recurnote.com</li>
              <li>Formulario de contacto en la aplicación</li>
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
