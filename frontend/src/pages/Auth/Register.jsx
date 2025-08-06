import { Link } from 'react-router-dom';
import '../../styles/auth.css';
import EmptyLogo from '../../components/Circles/CircleLarge/EmptyLogo.jsx';

export default function Register() {
  const isSmallScreen = window.innerWidth < 768;

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Logo de fondo */}
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />

      <div className="auth-box" style={{ position: 'relative', zIndex: 1 }}>
        <h2>Registrarse</h2>
        <form>
          <input type="text" placeholder="Nombre" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Contraseña" />
          <button type="submit">Crear cuenta</button>
        </form>
        <p>¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
      </div>
    </div>
  );
}