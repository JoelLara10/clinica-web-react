import { useEffect, useState } from 'react';
import ConfigHeader from './ConfigHeader';
import api from '../../services/api';
import './ConfigStyles.css';

export default function CamasConfigScreen() {
  const [camas, setCamas] = useState([]);
  const [form, setForm] = useState({
    numero: '',
    area: '',
    tipo: 'General',
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const cargarCamas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/beds');
      setCamas(response.data || []);
    } catch (error) {
      console.error('Error al cargar camas:', error);
      setMsg('No se pudieron cargar las camas de la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCamas();
  }, []);

  const save = async (e) => {
    e.preventDefault();

    if (!form.numero || !form.area) {
      setMsg('Captura número de cama y área.');
      return;
    }

    try {
      await api.post('/beds', {
        numero: form.numero,
        area: form.area,
        tipo: form.tipo,
        status: 'LIBRE',
      });

      setForm({
        numero: '',
        area: '',
        tipo: 'General',
      });

      setMsg('Cama guardada en la base de datos.');
      cargarCamas();
    } catch (error) {
      console.error('Error al guardar cama:', error);
      setMsg(error.response?.data?.error || 'No se pudo guardar la cama.');
    }
  };

  const toggleEstado = async (cama) => {
    const idCama = cama.id_cama || cama.id || cama._id;

    if (!idCama) {
      setMsg('No se encontró el ID de la cama.');
      return;
    }

    const estadoActual = cama.status || cama.estado || cama.estatus || 'LIBRE';
    const nuevoEstado = estadoActual === 'LIBRE' ? 'MANTENIMIENTO' : 'LIBRE';

    try {
      await api.put(`/beds/${idCama}`, {
        status: nuevoEstado,
      });

      setMsg('Estado actualizado.');
      cargarCamas();
    } catch (error) {
      console.error('Error al actualizar cama:', error);
      setMsg(error.response?.data?.error || 'No se pudo actualizar la cama.');
    }
  };

  const eliminarCama = async (cama) => {
    const idCama = cama.id_cama || cama.id || cama._id;

    if (!idCama) {
      setMsg('No se encontró el ID de la cama.');
      return;
    }

    if (!window.confirm('¿Seguro que deseas eliminar esta cama?')) {
      return;
    }

    try {
      await api.delete(`/beds/${idCama}`);
      setMsg('Cama eliminada correctamente.');
      cargarCamas();
    } catch (error) {
      console.error('Error al eliminar cama:', error);
      setMsg(error.response?.data?.error || 'No se pudo eliminar la cama.');
    }
  };

  return (
    <main className="config-page">
      <ConfigHeader title="Configuración de Camas" />

      <section className="config-content">
        <h2 className="config-section-title">🛏️ Alta de cama</h2>

        <form className="config-card config-form" onSubmit={save}>
          <label className="config-label">Número de cama</label>
          <input
            className="config-input"
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            placeholder="Ej. 203"
          />

          <label className="config-label">Área</label>
          <input
            className="config-input"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            placeholder="Ej. Urgencias"
          />

          <label className="config-label">Tipo</label>
          <input
            className="config-input"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            placeholder="General, Observación, UCI"
          />

          <button className="config-btn primary" type="submit">
            Guardar cama
          </button>

          {msg && <p className="config-cache">{msg}</p>}
        </form>

        <h2 className="config-section-title">Camas registradas</h2>

        {loading && (
          <div className="config-card">
            Cargando camas desde la base de datos...
          </div>
        )}

        {!loading && camas.length === 0 && (
          <div className="config-card">
            No hay camas registradas en la base de datos.
          </div>
        )}

        {!loading &&
          camas.map((cama, index) => {
            const id = cama.id_cama || cama.id || cama._id || index;
            const numero = cama.numero || cama.num_cama || cama.nombre || '--';
            const area = cama.area || 'Sin área';
            const tipo = cama.tipo || cama.type || 'General';
            const estado = cama.status || cama.estado || cama.estatus || 'LIBRE';

            return (
              <article className="config-card" key={id}>
                <div className="config-row">
                  <div>
                    <h3>Cama {numero}</h3>
                    <p>
                      {area} · {tipo}
                    </p>
                  </div>

                  <span className="config-badge">{estado}</span>
                </div>

                <div className="config-actions">
                  <button
                    className="config-btn secondary"
                    onClick={() => toggleEstado(cama)}
                  >
                    Cambiar estado
                  </button>

                  <button
                    className="config-btn danger"
                    onClick={() => eliminarCama(cama)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
      </section>
    </main>
  );
}