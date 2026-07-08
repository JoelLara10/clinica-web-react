import { useEffect, useState } from 'react';
import ConfigHeader from './ConfigHeader';
import { addConfigItem, deleteConfigItem, getConfigSection } from '../../services/configService';
import './ConfigStyles.css';

export default function ServiciosConfigScreen() {
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState({ clave: '', descripcion: '', costo: '', unidad: 'Servicio', tipo: 'Consulta' });
  const [msg, setMsg] = useState('');

  useEffect(() => { getConfigSection('servicios').then(setServicios); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.clave || !form.descripcion || !form.costo) return setMsg('Captura clave, descripción y costo.');
    setServicios(await addConfigItem('servicios', { id: `S-${Date.now()}`, ...form }));
    setForm({ clave: '', descripcion: '', costo: '', unidad: 'Servicio', tipo: 'Consulta' });
    setMsg('Servicio guardado en caché.');
  };

  return (
    <main className="config-page">
      <ConfigHeader title="Catálogo de Servicios" />
      <section className="config-content">
        <h2 className="config-section-title">📋 Registrar servicio</h2>
        <form className="config-card config-form" onSubmit={save}>
          <label className="config-label">Clave</label>
          <input className="config-input" value={form.clave} onChange={(e) => setForm({ ...form, clave: e.target.value.toUpperCase() })} placeholder="Ej. CONS-GEN" />
          <label className="config-label">Descripción</label>
          <input className="config-input" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej. Consulta general" />
          <label className="config-label">Costo principal</label>
          <input className="config-input" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} placeholder="Ej. 500" />
          <label className="config-label">Unidad de medida</label>
          <input className="config-input" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} placeholder="Servicio, estudio, pieza" />
          <label className="config-label">Tipo de servicio</label>
          <select className="config-select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            <option>Consulta</option><option>Laboratorio</option><option>Gabinete</option><option>Procedimiento</option><option>Otro</option>
          </select>
          <button className="config-btn primary" type="submit">Guardar servicio</button>
          {msg && <p className="config-cache">{msg}</p>}
        </form>

        <h2 className="config-section-title">Servicios registrados</h2>
        {servicios.map((s) => (
          <article className="config-card" key={s.id}>
            <div className="config-row">
              <div><h3>{s.descripcion}</h3><p>Clave: {s.clave} · Tipo: {s.tipo} · Unidad: {s.unidad}</p></div>
              <span className="config-badge">${s.costo}</span>
            </div>
            <div className="config-actions"><button className="config-btn danger" onClick={async () => setServicios(await deleteConfigItem('servicios', s.id))}>Eliminar</button></div>
          </article>
        ))}
      </section>
    </main>
  );
}
