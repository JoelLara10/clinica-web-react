import { useEffect, useState } from 'react';
import ConfigHeader from './ConfigHeader';
import { getConfigSection, saveConfigSection } from '../../services/configService';
import './ConfigStyles.css';

export default function AutomationConfigScreen() {
  const [form, setForm] = useState({ respaldosAutomaticos: true, horaRespaldo: '22:00', limpiarTemporales: true, diasRetencion: '30' });
  const [msg, setMsg] = useState('');

  useEffect(() => { getConfigSection('automatizacion').then(setForm); }, []);

  const save = async (e) => {
    e.preventDefault();
    await saveConfigSection('automatizacion', form);
    setMsg('Automatización guardada en caché.');
  };

  return (
    <main className="config-page">
      <ConfigHeader title="Automatización" />
      <section className="config-content">
        <form className="config-card config-form" onSubmit={save}>
          <div className="config-row">
            <div><h3>Respaldos automáticos</h3><p>Permite programar respaldos diarios del sistema.</p></div>
            <input className="config-switch" type="checkbox" checked={!!form.respaldosAutomaticos} onChange={(e) => setForm({ ...form, respaldosAutomaticos: e.target.checked })} />
          </div>

          <label className="config-label">Hora de respaldo</label>
          <input className="config-input" type="time" value={form.horaRespaldo} onChange={(e) => setForm({ ...form, horaRespaldo: e.target.value })} />

          <div className="config-row">
            <div><h3>Limpieza de temporales</h3><p>Ayuda a mantener la aplicación ordenada.</p></div>
            <input className="config-switch" type="checkbox" checked={!!form.limpiarTemporales} onChange={(e) => setForm({ ...form, limpiarTemporales: e.target.checked })} />
          </div>

          <label className="config-label">Días de retención</label>
          <input className="config-input" type="number" value={form.diasRetencion} onChange={(e) => setForm({ ...form, diasRetencion: e.target.value })} />

          <button className="config-btn primary" type="submit">Guardar automatización</button>
          {msg && <p className="config-cache">{msg}</p>}
        </form>
      </section>
    </main>
  );
}
