import { useEffect, useState } from 'react';
import ConfigHeader from './ConfigHeader';
import { getConfigSection, saveConfigSection } from '../../services/configService';
import './ConfigStyles.css';

export default function GeneralSettingsScreen() {
  const [form, setForm] = useState({ nombreClinica: '', telefono: '', direccion: '', moneda: 'MXN', tema: 'Morado', apiHost: '192.168.1.4', apiPort: '5001', apiPath: '/api/v1' });
  const [msg, setMsg] = useState('');

  useEffect(() => { getConfigSection('general').then((data) => setForm((old) => ({ ...old, ...data }))); }, []);

  const save = async (e) => {
    e.preventDefault();
    await saveConfigSection('general', form);
    setMsg('Configuración guardada en caché. Recarga la página para que Axios use la nueva URL si cambiaste la IP.');
  };

  return (
    <main className="config-page">
      <ConfigHeader title="Configuración General" />
      <section className="config-content">
        <div className="config-card">
          <h2>🏥 Datos de la clínica</h2>
          <p>Todo se guarda localmente en el caché del navegador con <b>localStorage</b>.</p>
        </div>

        <form className="config-card config-form" onSubmit={save}>
          <label className="config-label">Nombre de la clínica</label>
          <input className="config-input" value={form.nombreClinica} onChange={(e) => setForm({ ...form, nombreClinica: e.target.value })} />

          <label className="config-label">Teléfono</label>
          <input className="config-input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />

          <label className="config-label">Dirección</label>
          <input className="config-input" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />

          <label className="config-label">Moneda</label>
          <input className="config-input" value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value.toUpperCase() })} />

          <label className="config-label">Tema visual</label>
          <select className="config-select" value={form.tema} onChange={(e) => setForm({ ...form, tema: e.target.value })}>
            <option>Morado</option><option>Azul</option><option>Verde</option><option>Oscuro</option>
          </select>

          <h3>Conexión API</h3>
          <label className="config-label">IP del servidor</label>
          <input className="config-input" value={form.apiHost} onChange={(e) => setForm({ ...form, apiHost: e.target.value })} placeholder="192.168.1.4" />

          <label className="config-label">Puerto</label>
          <input className="config-input" value={form.apiPort} onChange={(e) => setForm({ ...form, apiPort: e.target.value })} placeholder="5001" />

          <label className="config-label">Ruta base</label>
          <input className="config-input" value={form.apiPath} onChange={(e) => setForm({ ...form, apiPath: e.target.value })} placeholder="/api/v1" />

          <button className="config-btn primary" type="submit">Guardar configuración</button>
          {msg && <p className="config-cache">{msg}</p>}
        </form>
      </section>
    </main>
  );
}
