import { useNavigate } from 'react-router-dom';
import {
  FiDatabase,
  FiHardDrive,
  FiPlus,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import './ConfigStyles.css';

export default function ConfigScreen() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Gestión de Camas',
      desc: 'Administra la disponibilidad y asignación de camas hospitalarias',
      badge: 'ADMINISTRADOR',
      icon: <MdLocalHospital />,
      color: '#3182ce',
      path: '/config/camas',
    },
    {
      title: 'Gestión de Personal',
      desc: 'Administra usuarios, roles y permisos del sistema',
      badge: 'ADMINISTRADOR',
      icon: <FiUsers />,
      color: '#38a169',
      path: '/config/usuarios',
    },
    {
      title: 'Diagnósticos',
      desc: 'Catálogo de diagnósticos y códigos CIE-10',
      badge: 'MÉDICO',
      icon: <FiTrendingUp />,
      color: '#ed8936',
      path: '/config/diagnosticos',
    },
    {
      title: 'Servicios',
      desc: 'Catálogo de servicios y procedimientos médicos',
      badge: 'CATÁLOGO',
      icon: <FiPlus />,
      color: '#f56565',
      path: '/config/servicios',
    },
    {
      title: 'Copias de Seguridad',
      desc: 'Respaldo y restauración de la base de datos',
      badge: 'ADMINISTRADOR',
      icon: <FiShield />,
      color: '#805ad5',
      path: '/config/backup',
    },
    {
      title: 'Rendimiento',
      desc: 'Monitoreo de CPU, RAM, disco y actividad del sistema',
      badge: 'MONITOREO',
      icon: <FiTrendingUp />,
      color: '#38b2ac',
      path: '/config/automatizacion',
    },
  ];

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <h1 style={styles.title}>Configuración del Sistema</h1>
          <p style={styles.subtitle}>
            Administra módulos, catálogos, usuarios, respaldos y parámetros del sistema INEO.
          </p>
        </div>
      </section>

      <section style={styles.grid}>
        {cards.map((item) => (
          <button
            key={item.title}
            type="button"
            style={styles.card}
            onClick={() => navigate(item.path)}
          >
            <span style={{ ...styles.badge, background: item.color }}>
              {item.badge}
            </span>

            <div style={{ ...styles.iconCircle, background: item.color }}>
              {item.icon}
            </div>

            <h2 style={styles.cardTitle}>{item.title}</h2>
            <p style={styles.cardText}>{item.desc}</p>
          </button>
        ))}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100%',
    padding: '32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  hero: {
    maxWidth: '1180px',
    margin: '0 auto 28px',
    padding: '28px 34px',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.14)',
    color: '#fff',
    boxShadow: '0 20px 45px rgba(0,0,0,0.18)',
  },
  title: {
    margin: 0,
    fontSize: '34px',
    fontWeight: 800,
  },
  subtitle: {
    margin: '8px 0 0',
    fontSize: '16px',
    opacity: 0.9,
  },
  grid: {
    maxWidth: '1180px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '28px',
  },
  card: {
    position: 'relative',
    minHeight: '290px',
    padding: '30px 26px',
    border: 'none',
    borderRadius: '18px',
    background: '#f7f7fb',
    textAlign: 'left',
    cursor: 'pointer',
    boxShadow: '0 18px 40px rgba(0,0,0,0.22)',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '8px 14px',
    borderRadius: '999px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.04em',
    boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
  },
  iconCircle: {
    width: '120px',
    height: '120px',
    margin: '0 auto 28px',
    borderRadius: '50%',
    color: '#fff',
    fontSize: '56px',
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 18px 30px rgba(0,0,0,0.18)',
  },
  cardTitle: {
    margin: '0 0 10px',
    fontSize: '23px',
    fontWeight: 800,
    color: '#2d3748',
  },
  cardText: {
    margin: 0,
    fontSize: '15px',
    lineHeight: 1.5,
    color: '#718096',
  },
};