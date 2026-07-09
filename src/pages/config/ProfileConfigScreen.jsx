import { useAuth } from '../../context/AuthContext';
import ConfigHeader from './ConfigHeader';
import './ConfigStyles.css';

export default function ProfileConfigScreen(){const{user}=useAuth();return <main className="config-page"><ConfigHeader title="Mi Perfil"/><section className="config-content"><div className="config-card config-profile"><div className="config-avatar">{user?.username?.charAt(0)?.toUpperCase()||'U'}</div><div><h2>{user?.nombre||user?.username||'Usuario'}</h2><span className="config-badge">{user?.role||'sin rol'}</span><p className="config-cache">Usuario autenticado actualmente en el sistema.</p></div></div><div className="config-card"><h3>Datos del perfil</h3><p><b>Usuario:</b> {user?.username||'No disponible'}</p><p><b>Rol:</b> {user?.role||'No disponible'}</p><p><b>Email:</b> {user?.email||'No disponible'}</p><p><b>Teléfono:</b> {user?.telefono||'No disponible'}</p></div></section></main>}
