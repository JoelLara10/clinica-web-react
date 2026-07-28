import { useNavigate } from 'react-router-dom';
import { FiDatabase, FiHardDrive, FiShield, FiTrendingUp, FiUsers, FiUser } from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import ConfigHeader from './ConfigHeader';
import './ConfigStyles.css';

const cards = [
  { title: 'Gestión de Camas',     desc: 'Administra las camas, áreas y disponibilidad del hospital.',         icon: <MdLocalHospital size={36} />, color: '#3182ce', badge: 'ADMIN',      path: '/config/camas' },
  { title: 'Usuarios del Sistema', desc: 'Registra y gestiona los usuarios y roles del sistema.',               icon: <FiUsers size={36} />,         color: '#38a169', badge: 'ADMIN',      path: '/config/usuarios' },
  { title: 'Diagnósticos',         desc: 'Catálogo de diagnósticos CIE-10 disponibles para los médicos.',       icon: <FiTrendingUp size={36} />,    color: '#ed8936', badge: 'MÉDICO',     path: '/config/diagnosticos' },
  { title: 'Catálogo de Servicios',desc: 'Administra los servicios, precios y unidades del hospital.',          icon: <FiDatabase size={36} />,      color: '#f56565', badge: 'CATÁLOGO',   path: '/config/servicios' },
  { title: 'Copias de Seguridad',  desc: 'Crea, restaura y descarga respaldos de la base de datos.',           icon: <FiShield size={36} />,        color: '#805ad5', badge: 'ADMIN',      path: '/config/backup' },
  { title: 'Automatización',       desc: 'Programa respaldos automáticos con intervalo y colecciones.',         icon: <FiHardDrive size={36} />,     color: '#38b2ac', badge: 'SISTEMA',    path: '/config/automatizacion' },
  { title: 'Mi Perfil',            desc: 'Consulta los datos del usuario autenticado actualmente.',             icon: <FiUser size={36} />,          color: '#667eea', badge: 'PERFIL',     path: '/config/perfil' },
];

export default function ConfigScreen() {
  const navigate = useNavigate();

  return (
    <main className="config-page">
      <ConfigHeader title="Configuración del Sistema" showBack={false} />
      <section className="config-content">
        <div className="config-cards-grid">
          {cards.map((item) => (
            <button
              key={item.path}
              type="button"
              className="config-card config-nav-card"
              onClick={() => navigate(item.path)}
            >
              <span className="config-nav-badge" style={{ background: item.color }}>{item.badge}</span>
              <div className="config-nav-icon" style={{ background: item.color }}>{item.icon}</div>
              <h2 className="config-nav-title">{item.title}</h2>
              <p className="config-nav-desc">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
