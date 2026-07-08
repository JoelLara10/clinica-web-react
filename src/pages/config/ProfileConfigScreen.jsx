import ConfigHeader from './ConfigHeader';
import { useAuth } from '../../context/AuthContext';
import './ConfigStyles.css';

export default function ProfileConfigScreen() {
  const { user } = useAuth();
  return (
    <main className="config-page">
      <ConfigHeader title="Mi Perfil" />
      <section className="config-content">
        <div className="config-card config-profile">
          <div className="config-avatar">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div>
            <h2>{user?.username || 'Usuario'}</h2>
            <span className="config-badge">{user?.role?.toUpperCase() || 'SIN ROL'}</span>
            <p>Información tomada de la sesión guardada en el navegador.</p>
          </div>
        </div>
        <div className="config-card">
          <h3>Información de sesión</h3>
          <p>Usuario: {user?.username || 'No disponible'}</p>
          <p>Rol: {user?.role || 'No disponible'}</p>
        </div>
      </section>
    </main>
  );
}
