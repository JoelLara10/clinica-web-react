import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConfigCacheInfo } from '../../services/configService';
import ConfigHeader from './ConfigHeader';
import './ConfigStyles.css';

export default function ConfigScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const cacheInfo = getConfigCacheInfo();

  const menuItems = [
    { title: 'Configuración General', emoji: '🏥', path: '/config/general', desc: 'Datos de clínica, tema y conexión API.' },
    { title: 'Usuarios del Sistema', emoji: '👥', path: '/config/usuarios', desc: 'Alta, baja y estado de usuarios.' },
    { title: 'Configuración de Camas', emoji: '🛏️', path: '/config/camas', desc: 'Catálogo de camas, áreas y estados.' },
    { title: 'Catálogo de Servicios', emoji: '📋', path: '/config/servicios', desc: 'Servicios, unidades, costos y claves.' },
    { title: 'Automatización', emoji: '⚙️', path: '/config/automatizacion', desc: 'Respaldos automáticos y limpieza local.' },
    { title: 'Copias de Seguridad', emoji: '💾', path: '/config/backup', desc: 'Crear respaldos y restaurar datos.' },
    { title: 'Mi Perfil', emoji: '👤', path: '/config/perfil', desc: 'Información del usuario actual.' },
  ];

  return (
    <main className="config-page">
      <ConfigHeader title="Configuración" />
      <section className="config-content">
        <div className="config-card config-profile">
          <div className="config-avatar">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div>
            <h2>{user?.username || 'Usuario'}</h2>
            <span className="config-badge">{user?.role?.toUpperCase() || 'SIN ROL'}</span>
            <p className="config-cache">Caché local: {cacheInfo?.updatedAt ? new Date(cacheInfo.updatedAt).toLocaleString() : 'sin cambios registrados'}</p>
          </div>
        </div>

        <div className="config-grid">
          {menuItems.map((item) => (
            <button key={item.path} className="config-card config-menu-card" onClick={() => navigate(item.path)}>
              <div className="config-menu-emoji">{item.emoji}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </button>
          ))}
        </div>

        <div className="config-actions">
          <button className="config-btn danger" onClick={() => window.confirm('¿Cerrar sesión?') && logout()}>Cerrar sesión</button>
        </div>
      </section>
    </main>
  );
}
