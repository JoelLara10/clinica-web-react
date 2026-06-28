import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';
import {
  FiHome, FiSettings, FiLogOut, FiUser, FiHeart, FiFileText,
  FiClipboard, FiActivity, FiPrinter, FiMonitor,
} from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import './Sidebar.css';

const iconMap = {
  'home-outline': FiHome,
  'speedometer-outline': FiActivity,
  'medkit-outline': FiHeart,
  'flask-outline': FiActivity,
  'document-text-outline': FiFileText,
  'heart-outline': FiHeart,
  'clipboard-outline': FiClipboard,
  'scan-outline': FiMonitor,
  'print-outline': FiPrinter,
  'settings-outline': FiSettings,
  'options-outline': FiSettings,
  'pulse-outline': FiActivity,
  'folder-open-outline': FiFileText,
};

const Icon = ({ name, size = 20, color = '#718096' }) => {
  const Component = iconMap[name] || FiHome;
  return <Component size={size} color={color} />;
};

const roleLabels = {
  admin: 'ADMIN', administrativo: 'ADMINISTRATIVO',
  medico: 'MÉDICO', enfermero: 'ENFERMERÍA',
  enfermeria: 'ENFERMERÍA', estudios: 'ESTUDIOS',
};

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { selectedPatient } = usePatient();

  const role = user?.role;
  const isAdmin      = role === 'admin';
  const isMedico     = role === 'medico';
  const isEnfermeria = role === 'enfermero' || role === 'enfermeria';
  const isEstudios   = role === 'estudios';
  const isPatientSelected = !!selectedPatient?.id_atencion;

  const currentPath = location.pathname;
  const currentModule = currentPath.startsWith('/enfermeria') ? 'enfermeria'
    : currentPath.startsWith('/medico') ? 'medico'
    : currentPath.startsWith('/estudios') ? 'estudios'
    : 'general';

  const handleNav = (path) => {
    const patientState = selectedPatient?.id_atencion
      ? {
          id_atencion: selectedPatient.id_atencion,
          Id_exp: selectedPatient?.Id_exp,
        }
      : undefined;

    navigate(path, { state: patientState });
    onClose?.();
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) logout();
  };

  // Construir secciones del menú (igual que móvil)
  const menuSections = [];

  const principalItems = [
    { name: 'Dashboard', icon: 'home-outline', path: '/', requiresPatient: false },
  ];

  if (isMedico || (isAdmin && currentModule === 'medico'))
    principalItems.push({ name: 'Panel Médico', icon: 'speedometer-outline', path: '/medico', requiresPatient: false });

  if (isEnfermeria || (isAdmin && currentModule === 'enfermeria'))
    principalItems.push({ name: 'Panel Enfermería', icon: 'medkit-outline', path: '/enfermeria', requiresPatient: false });

  if (isEstudios || (isAdmin && currentModule === 'estudios'))
    principalItems.push({ name: 'Panel Estudios', icon: 'flask-outline', path: '/estudios', requiresPatient: false });

  menuSections.push({ title: 'PRINCIPAL', items: principalItems });

  if (isMedico || (isAdmin && currentModule === 'medico')) {
    menuSections.push({
      title: 'HISTORIA CLÍNICA',
      items: [{ name: 'Historia Clínica', icon: 'document-text-outline', path: '/medico/historia-clinica', requiresPatient: true }],
    });
    menuSections.push({
      title: 'NOTAS MÉDICAS',
      items: [
        { name: 'Signos Vitales',           icon: 'heart-outline',         path: '/medico/signos-vitales',   requiresPatient: true },
        { name: 'Nota Médica (SOAP)',        icon: 'document-text-outline', path: '/medico/nota-medica',      requiresPatient: true },
        { name: 'Diagnóstico',              icon: 'clipboard-outline',     path: '/medico/diagnostico',      requiresPatient: true },
        { name: 'Receta',                   icon: 'medkit-outline',        path: '/medico/receta',           requiresPatient: true },
        { name: 'Exámenes de Laboratorio',  icon: 'flask-outline',         path: '/medico/lab-exams',        requiresPatient: true },
        { name: 'Exámenes de Gabinete',     icon: 'scan-outline',          path: '/medico/imaging-exams',    requiresPatient: true },
      ],
    });
    menuSections.push({
      title: 'DOCUMENTOS',
      items: [
        { name: 'Imprimir Documentos',    icon: 'print-outline',         path: '/medico/imprimir',   requiresPatient: true },
        { name: 'Resultados de Estudios', icon: 'document-text-outline', path: '/medico/resultados', requiresPatient: true },
      ],
    });
  }

  if (isEnfermeria || (isAdmin && currentModule === 'enfermeria')) {
    menuSections.push({
      title: 'NOTAS DE ENFERMERÍA',
      items: [
        { name: 'Signos Vitales',              icon: 'heart-outline',         path: '/enfermeria/signos-vitales', requiresPatient: true },
        { name: 'Nota de Enfermería',          icon: 'document-text-outline', path: '/enfermeria/nota',           requiresPatient: true },
        { name: 'Administración Medicamentos', icon: 'medkit-outline',        path: '/enfermeria/medicamentos',   requiresPatient: true },
      ],
    });
  }

  if (isEstudios || isAdmin) {
    menuSections.push({
      title: 'ESTUDIOS',
      items: [
        { name: 'Solicitudes Lab',      icon: 'flask-outline',         path: '/estudios?section=solicitudes_lab', requiresPatient: false },
        { name: 'Solicitudes Gabinete', icon: 'scan-outline',          path: '/estudios?section=solicitudes_gab', requiresPatient: false },
        { name: 'Resultados Lab',       icon: 'document-text-outline', path: '/estudios?section=resultados_lab',  requiresPatient: false },
        { name: 'Resultados Gabinete',  icon: 'folder-open-outline',   path: '/estudios?section=resultados_gab',  requiresPatient: false },
      ],
    });
  }

  const moduleItems = [];
  if (isAdmin || role === 'administrativo')
    moduleItems.push({ name: 'Administración', icon: 'settings-outline', path: '/admin',       requiresPatient: false });
  if (isAdmin || isMedico)
    moduleItems.push({ name: 'Médico',         icon: 'pulse-outline',    path: '/medico',      requiresPatient: false });
  if (isAdmin || isEnfermeria)
    moduleItems.push({ name: 'Enfermería',     icon: 'medkit-outline',   path: '/enfermeria',  requiresPatient: false });
  if (isAdmin || isEstudios)
    moduleItems.push({ name: 'Estudios',       icon: 'flask-outline',    path: '/estudios',    requiresPatient: false });
  if (isAdmin)
    moduleItems.push({ name: 'Configuración',  icon: 'options-outline',  path: '/config',      requiresPatient: false });

  if (moduleItems.length) menuSections.push({ title: 'MÓDULOS', items: moduleItems });

  const userPrefix = isEnfermeria ? 'Enf.' : 'Dr.';
  const roleLabel = roleLabels[role] || 'USUARIO';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="brand-row">
          <span className="brand-title">INEO</span>
          <span className="brand-version">v2.0</span>
        </div>
        <div className="user-info">
          <div className="user-avatar"><FiUser size={28} color="#fff" /></div>
          <div>
            <p className="user-name">{userPrefix} {user?.username}</p>
            <span className="role-badge">{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="sidebar-nav">
        {menuSections.map((section, si) => (
          <div key={si} className="nav-section">
            <p className="section-title">{section.title}</p>
            {section.items.map((item, ii) => {
              const enabled = !item.requiresPatient || isPatientSelected;
              const active  = currentPath === item.path || currentPath.startsWith(item.path + '/');
              return (
                <button
                  key={ii}
                  className={`nav-item ${active ? 'active' : ''} ${!enabled ? 'disabled' : ''}`}
                  onClick={() => {
                    if (enabled) handleNav(item.path);
                    else alert('Seleccione un paciente primero');
                  }}
                >
                  <Icon name={item.icon} color={!enabled ? '#a0aec0' : active ? '#667eea' : '#718096'} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        <FiLogOut size={20} color="#e53e3e" />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
}