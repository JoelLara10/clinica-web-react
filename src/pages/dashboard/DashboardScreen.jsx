import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FiUsers, FiActivity, FiLogOut, FiSettings, FiRefreshCw,
} from 'react-icons/fi';
import { MdLocalHospital, MdOutlineBed } from 'react-icons/md';
import { GiMedicinePills, GiChemicalDrop } from 'react-icons/gi';
import moment from 'moment';
import 'moment/locale/es';
import './DashboardScreen.css';

moment.locale('es');

const iconMap = {
  'business-outline': FiSettings,
  'medkit-outline':   GiMedicinePills,
  'pulse-outline':    FiActivity,
  'flask-outline':    GiChemicalDrop,
  'settings-outline': FiSettings,
};

const Icon = ({ name, size = 36, color = '#667eea' }) => {
  const Component = iconMap[name] || FiActivity;
  return <Component size={size} color={color} />;
};

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    active_patients: { total: 0 },
    bed_occupancy:   { occupied: 0 },
  });
  const [pendingStudies, setPendingStudies] = useState({ total: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, studiesRes] = await Promise.all([
        api.get('/analytics/dashboard').catch(() => ({ data: {} })),
        api.get('/exams/counts').catch(() => ({ data: { total: 0 } })),
      ]);
      setStats(statsRes.data);
      setPendingStudies(studiesRes.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getMenuOptions = () => {
    const role = user?.role?.toLowerCase();
    const studies = { name: 'Estudios', icon: 'flask-outline', path: '../estudios/', color: '#ed8936', description: 'Gestión de exámenes', badge: pendingStudies.total };

    if (role === 'admin' || role === 'administrativo') return [
      { name: 'Administrativo', icon: 'business-outline', path: '/admin',      color: '#667eea', description: 'Gestión de pacientes y cuentas' },
      { name: 'Enfermería',     icon: 'medkit-outline',   path: '/enfermeria', color: '#f56565', description: 'Atención y cuidados de enfermería' },
      { name: 'Médico',         icon: 'pulse-outline',    path: '/medico',     color: '#48bb78', description: 'Atención médica y recetas' },
      { ...studies },
      { name: 'Configuración',  icon: 'settings-outline', path: '/config',     color: '#718096', description: 'Configuración del sistema' },
    ];
    if (role === 'enfermero' || role === 'enfermeria') return [
      { name: 'Enfermería', icon: 'medkit-outline', path: '/enfermeria', color: '#9f7aea', description: 'Atención de enfermería y signos vitales' },
    ];
    if (role === 'medico') return [
      { name: 'Médico',  icon: 'pulse-outline', path: '/medico',   color: '#48bb78', description: 'Atención médica' },
      { ...studies, description: 'Resultados' },
    ];
    if (role === 'estudios') return [{ ...studies }];
    return [];
  };

  const menuOptions = getMenuOptions();

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-content">
          <div>
            <h2 className="dash-greeting">¡Hola, {user?.username || 'Usuario'}!</h2>
            <p className="dash-date">{moment().format('dddd, D [de] MMMM [de] YYYY')}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="dash-icon-btn" onClick={onRefresh} title="Actualizar">
              <FiRefreshCw size={22} color="#fff" className={refreshing ? 'spin' : ''} />
            </button>
            <button className="dash-icon-btn" onClick={logout} title="Cerrar sesión">
              <FiLogOut size={22} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <FiUsers size={32} color="#667eea" />
          <span className="stat-number">{stats.active_patients?.total || 0}</span>
          <span className="stat-label">Pacientes Activos</span>
        </div>
        <div className="stat-card">
          <MdOutlineBed size={32} color="#48bb78" />
          <span className="stat-number">{stats.bed_occupancy?.occupied || 0}</span>
          <span className="stat-label">Camas Ocupadas</span>
        </div>
        <div className="stat-card">
          <GiChemicalDrop size={32} color="#ed8936" />
          <span className="stat-number">{pendingStudies.total || 0}</span>
          <span className="stat-label">Estudios Pendientes</span>
        </div>
      </div>

      {/* Menu */}
      <div className="menu-container">
        <h3 className="menu-title">Módulos del Sistema</h3>
        <div className="menu-grid">
          {menuOptions.map((option, i) => (
            <button
              key={i}
              className="menu-card"
              onClick={() => navigate(option.path)}
            >
              {option.badge > 0 && (
                <span className="badge">{option.badge}</span>
              )}
              <div className="menu-icon-wrap" style={{ backgroundColor: `${option.color}20` }}>
                <Icon name={option.icon} size={36} color={option.color} />
              </div>
              <span className="menu-name">{option.name}</span>
              <span className="menu-desc">{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}