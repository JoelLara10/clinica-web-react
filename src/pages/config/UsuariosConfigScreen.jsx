import { useEffect, useState } from 'react';
import ConfigHeader from './ConfigHeader';
import api from '../../services/api';
import './ConfigStyles.css';

export default function UsuariosConfigScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    usuario: '',
    password: '',
    rol: 'medico',
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setMsg('');

      const response = await api.get('/auth/users');

      setUsuarios(response.data?.data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setMsg(error.response?.data?.error || 'No se pudieron cargar los usuarios de la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const save = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.usuario || !form.password) {
      setMsg('Faltan nombre, usuario y contraseña.');
      return;
    }

    try {
      await api.post('/auth/users', {
        nombre: form.nombre,
        username: form.usuario,
        password: form.password,
        role: form.rol,
        activo: true,
      });

      setForm({
        nombre: '',
        usuario: '',
        password: '',
        rol: 'medico',
      });

      setMsg('Usuario guardado en la base de datos.');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setMsg(error.response?.data?.error || 'No se pudo guardar el usuario.');
    }
  };

  const cambiarEstado = async (usuario) => {
    const id = usuario.id || usuario._id;

    if (!id) {
      setMsg('No se encontró el ID del usuario.');
      return;
    }

    try {
      await api.put(`/auth/users/${id}`, {
        activo: !usuario.activo,
      });

      setMsg('Estado actualizado.');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setMsg(error.response?.data?.error || 'No se pudo actualizar el usuario.');
    }
  };

  const remove = async (usuario) => {
    const id = usuario.id || usuario._id;

    if (!id) {
      setMsg('No se encontró el ID del usuario.');
      return;
    }

    if (!window.confirm('¿Eliminar usuario?')) return;

    try {
      await api.delete(`/auth/users/${id}`);
      setMsg('Usuario eliminado correctamente.');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setMsg(error.response?.data?.error || 'No se pudo eliminar el usuario.');
    }
  };

  return (
    <main className="config-page">
      <ConfigHeader title="Usuarios del Sistema" />

      <section className="config-content">
        <h2 className="config-section-title">👥 Registrar usuario</h2>

        <form className="config-card config-form" onSubmit={save}>
          <label className="config-label">Nombre completo</label>
          <input
            className="config-input"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej. Dra. Ana López"
          />

          <label className="config-label">Usuario</label>
          <input
            className="config-input"
            value={form.usuario}
            onChange={(e) => setForm({ ...form, usuario: e.target.value })}
            placeholder="Ej. ana.lopez"
          />

          <label className="config-label">Contraseña</label>
          <input
            className="config-input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Contraseña del usuario"
          />

          <label className="config-label">Rol</label>
          <select
            className="config-select"
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
          >
            <option value="admin">admin</option>
            <option value="administrativo">administrativo</option>
            <option value="medico">medico</option>
            <option value="enfermeria">enfermeria</option>
            <option value="estudios">estudios</option>
          </select>

          <button className="config-btn primary" type="submit">
            Guardar usuario
          </button>

          {msg && <p className="config-cache">{msg}</p>}
        </form>

        <h2 className="config-section-title">Usuarios registrados</h2>

        {loading && (
          <div className="config-card">
            Cargando usuarios desde la base de datos...
          </div>
        )}

        {!loading && usuarios.length === 0 && (
          <div className="config-card">
            No hay usuarios registrados en la base de datos.
          </div>
        )}

        {!loading &&
          usuarios.map((u) => (
            <article className="config-card" key={u.id}>
              <div className="config-row">
                <div>
                  <h3>{u.nombre || 'Sin nombre'}</h3>
                  <p>
                    Usuario: {u.username || u.usuario} · Rol: {u.role || u.rol}
                  </p>
                </div>

                <label className="config-row">
                  <input
                    className="config-switch"
                    type="checkbox"
                    checked={!!u.activo}
                    onChange={() => cambiarEstado(u)}
                  />
                  <span className="config-badge">
                    {u.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </label>
              </div>

              <div className="config-actions">
                <button
                  className="config-btn danger"
                  onClick={() => remove(u)}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
      </section>
    </main>
  );
}