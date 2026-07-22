import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      title: t('config.bedManagement'),
      desc: t('config.bedManagementDesc'),
      badge: t('config.admin'),
      icon: <MdLocalHospital />,
      color: '#3182ce',
      path: '/config/camas',
    },
    {
      title: t('config.staffManagement'),
      desc: t('config.staffManagementDesc'),
      badge: t('config.admin'),
      icon: <FiUsers />,
      color: '#38a169',
      path: '/config/usuarios',
    },
    {
      title: t('config.diagnoses'),
      desc: t('config.diagnosesDesc'),
      badge: t('config.medical'),
      icon: <FiTrendingUp />,
      color: '#ed8936',
      path: '/config/diagnosticos',
    },
    {
      title: t('config.services'),
      desc: t('config.servicesDesc'),
      badge: t('config.catalog'),
      icon: <FiPlus />,
      color: '#f56565',
      path: '/config/servicios',
    },
    {
      title: t('config.backups'),
      desc: t('config.backupsDesc'),
      badge: t('config.admin'),
      icon: <FiShield />,
      color: '#805ad5',
      path: '/config/backup',
    },
    {
      title: t('config.performance'),
      desc: t('config.performanceDesc'),
      badge: t('config.monitoring'),
      icon: <FiTrendingUp />,
      color: '#38b2ac',
      path: '/config/automatizacion',
    },
  ];

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <h1 style={styles.title}>{t('config.title')}</h1>
          <p style={styles.subtitle}>
            {t('config.subtitle')}
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
