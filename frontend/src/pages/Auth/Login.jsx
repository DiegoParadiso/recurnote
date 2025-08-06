import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth.css';
import EmptyLogo from '../../components/common/EmptyLogo.jsx';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const isSmallScreen = window.innerWidth < 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');  // Redirige al home si login OK
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <EmptyLogo circleSize="500px" isSmallScreen={isSmallScreen} />
      <div className="auth-box" style={{ position: 'relative', zIndex: 1 }}>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
        <p>¿No tenés cuenta? <Link to="/register">Registrate</Link></p>
      </div>
    </div>
  );
}
