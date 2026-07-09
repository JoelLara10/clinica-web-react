import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiSave, FiSearch, FiTrash2, FiUserPlus, FiX } from 'react-icons/fi';
import ConfigHeader from './ConfigHeader';
import api from '../../services/api';
import { getCache, setCache, paginate, pages } from './configCache';
import './ConfigStyles.css';

const CACHE_KEY = 'usuarios';
const ITEMS_PER_PAGE = 6;

const emptyForm = {
  curp: '', nombre: '', papell: '', sapell: '', fecnac: '', telefono: '', matricula: '', cedula: '',
  cargo: '', email: '', pregunta_seguridad: '', username: '', password: '', role: '', activo: true,
};

export default function UsuariosConfigScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setMsg('');
    if (!force) {
      const cached = getCache(CACHE_KEY);
      if (cached) {
        setUsuarios(cached);
        setLoading(false);
        return;
      }
    }
    try {
      const response = await api.get('/auth/users');
      const data = response.data?.data || response.data || [];
      setUsuarios(Array.isArray(data) ? data : []);
      setCache(CACHE_KEY, Array.isArray(data) ? data : []);
    } catch (error) {
      const cached = getCache(CACHE_KEY);
      if (cached) {
        setUsuarios(cached);
        setMsg('Sin conexión. Se muestran usuarios guardados en caché.');
      } else {
        setMsg(error.response?.data?.error || 'No se pudieron cargar usuarios.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => `${u.nombre || ''} ${u.papell || ''} ${u.sapell || ''} ${u.username || ''} ${u.role || ''} ${u.email || ''}`.toLowerCase().includes(q));
  }, [usuarios, search]);

  const totalPages = pages(filtered, ITEMS_PER_PAGE);
  const list = paginate(filtered, page, ITEMS_PER_PAGE);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await load(true);
    setRefreshing(false);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.nombre || !form.username || !form.password || !form.role) {
      setMsg('Captura nombre, usuario, contraseña y rol.');
      return;
    }
    try {
      const payload = { ...form, activo: true };
      await api.post('/auth/users', payload);
      setForm(emptyForm);
      setMsg('Usuario guardado correctamente.');
      await load(true);
    } catch (error) {
      setMsg(error.response?.data?.error || 'No se pudo guardar el usuario.');
    }
  };

  const toggle = async (u) => {
    const id = u.id || u._id;
    if (!id) return setMsg('No se encontró el ID del usuario.');
    try {
      await api.put(`/auth/users/${id}`, { activo: !u.activo });
      await load(true);
    } catch (error) {
      setMsg(error.response?.data?.error || 'No se pudo actualizar el usuario.');
    }
  };

  const remove = async (u) => {
    const id = u.id || u._id;
    if (!id) return setMsg('No se encontró el ID del usuario.');
    if (!window.confirm('¿Eliminar usuario?')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      await load(true);
      setMsg('Usuario eliminado correctamente.');
    } catch (error) {
      setMsg(error.response?.data?.error || 'No se pudo eliminar el usuario.');
    }
  };

  return (
    <main className="config-page">
      <ConfigHeader title="Usuarios del Sistema" right={<button className="config-refresh-btn" type="button" onClick={onRefresh}><FiRefreshCw className={refreshing ? 'spin' : ''} /></button>} />
      <section className="config-content">
        <form className="config-card config-main-card" onSubmit={save}>
          <div className="config-card-header"><FiUserPlus size={28} /><h2>Registrar Nuevo Usuario</h2></div>
          <div className="config-card-body">
            <div className="config-section-box">
              <h3 className="config-subtitle">🪪 Datos Personales</h3>
              <label className="config-label">CURP</label>
              <input className="config-input" value={form.curp} onChange={(e) => setForm({ ...form, curp: e.target.value.toUpperCase() })} placeholder="Ingrese CURP" />
              <label className="config-label">Nombre(s)</label>
              <input className="config-input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ingrese nombre(s)" />
              <div className="config-grid-2">
                <div><label className="config-label">Primer Apellido</label><input className="config-input" value={form.papell} onChange={(e) => setForm({ ...form, papell: e.target.value })} placeholder="Ingrese primer apellido" /></div>
                <div><label className="config-label">Segundo Apellido</label><input className="config-input" value={form.sapell} onChange={(e) => setForm({ ...form, sapell: e.target.value })} placeholder="Ingrese segundo apellido" /></div>
              </div>
              <div className="config-grid-2">
                <div><label className="config-label">Fecha de nacimiento</label><input className="config-input" type="date" value={form.fecnac} onChange={(e) => setForm({ ...form, fecnac: e.target.value })} /></div>
                <div><label className="config-label">Teléfono</label><input className="config-input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Ingrese teléfono" /></div>
              </div>
              <div className="config-grid-2">
                <div><label className="config-label">Matrícula</label><input className="config-input" value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} placeholder="Matrícula opcional" /></div>
                <div><label className="config-label">Cédula Profesional</label><input className="config-input" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} placeholder="Cédula opcional" /></div>
              </div>
            </div>

            <div className="config-section-box">
              <h3 className="config-subtitle">⚙️ Datos del Sistema</h3>
              <div className="config-grid-2">
                <div><label className="config-label">Cargo</label><input className="config-input" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} placeholder="Ej. Médico General" /></div>
                <div><label className="config-label">Correo</label><input className="config-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" /></div>
              </div>
              <label className="config-label">Pregunta de seguridad</label>
              <input className="config-input" value={form.pregunta_seguridad} onChange={(e) => setForm({ ...form, pregunta_seguridad: e.target.value })} placeholder="Ej. ¿Nombre de tu primera mascota?" />
              <div className="config-grid-3">
                <div><label className="config-label">Usuario</label><input className="config-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Usuario" /></div>
                <div><label className="config-label">Contraseña</label><input className="config-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contraseña" /></div>
                <div><label className="config-label">Rol</label><select className="config-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="">Seleccionar rol</option><option value="admin">Administrador</option><option value="administrativo">Administrativo</option><option value="medico">Médico</option><option value="enfermero">Enfermero</option><option value="enfermeria">Enfermería</option><option value="estudios">Estudios</option></select></div>
              </div>
            </div>
            <div className="config-form-footer"><button className="config-btn secondary" type="button" onClick={() => setForm(emptyForm)}><FiX /> Cancelar</button><button className="config-btn success" type="submit"><FiSave /> Guardar Usuario</button></div>
            {msg && <div className="config-alert">{msg}</div>}
          </div>
        </form>

        <h2 className="config-section-title">Usuarios registrados</h2>
        <div className="config-search"><FiSearch className="config-search-icon" /><input className="config-input" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nombre, usuario, rol o correo..." /></div>
        {loading ? <div className="config-card">Cargando usuarios...</div> : null}
        {!loading && list.map((u) => <article className="config-card" key={u.id || u._id || u.username}><div className="config-row"><div><h3>{u.nombre || 'Sin nombre'} {u.papell || ''} {u.sapell || ''}</h3><p>Usuario: {u.username || 'Sin usuario'} · Rol: {u.role || 'Sin rol'}</p>{u.email && <p>Correo: {u.email}</p>}</div><label className="config-row"><input className="config-switch" type="checkbox" checked={!!u.activo} onChange={() => toggle(u)} /><span className={`config-badge ${u.activo ? 'success' : 'danger'}`}>{u.activo ? 'ACTIVO' : 'INACTIVO'}</span></label></div><div className="config-actions"><button className="config-btn danger" type="button" onClick={() => remove(u)}><FiTrash2 /> Eliminar</button></div></article>)}
        {!loading && filtered.length === 0 ? <div className="config-card">No hay usuarios registrados.</div> : null}
        {filtered.length > ITEMS_PER_PAGE && <div className="config-pagination"><button className="config-btn secondary" disabled={page === 1} onClick={() => setPage(page - 1)}><FiChevronLeft /></button><span className="config-page-pill">{page} / {totalPages}</span><button className="config-btn secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}><FiChevronRight /></button></div>}
      </section>
    </main>
  );
}
