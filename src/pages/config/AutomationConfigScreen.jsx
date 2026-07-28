import { useEffect, useState } from 'react';
import { FiClock, FiSave } from 'react-icons/fi';
import ConfigHeader from './ConfigHeader';
import backupService from '../../services/backupService';
import './ConfigStyles.css';
import './BackupStyles.css';

const defaults = { activo: false, tipo: 'completa', formato: 'json', intervalo: 1440, max_backups: 4, colecciones: [] };

export default function AutomationConfigScreen() {
  const [form, setForm] = useState(defaults);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([backupService.getAutomation(), backupService.collections()])
      .then(([config, names]) => {
        setForm({ ...defaults, ...config, colecciones: config.colecciones?.length ? config.colecciones : names });
        setCollections(names);
      })
      .catch((error) => setMessage(error.response?.data?.error || 'No se pudo cargar la automatización.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleCollection = (name) => setForm((current) => ({
    ...current,
    colecciones: current.colecciones.includes(name)
      ? current.colecciones.filter((item) => item !== name)
      : [...current.colecciones, name],
  }));

  const save = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await backupService.updateAutomation(form);
      setForm(result);
      setMessage(result.activo ? 'Automatización guardada y activada.' : 'Automatización guardada y desactivada.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'No se pudo guardar la automatización.');
    } finally { setLoading(false); }
  };

  return <main className="config-page"><ConfigHeader title="Automatización de Respaldos" /><section className="config-content"><form className="config-card config-main-card" onSubmit={save}>
    <div className="config-card-header"><FiClock size={26} /><h2>Programar respaldos automáticos</h2></div><div className="config-card-body">
      <div className="config-section-box"><label className="config-toggle-row"><span><strong>Activar respaldos automáticos</strong><small>El servidor ejecutará la tarea aunque la página esté cerrada.</small></span><input className="config-switch" type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /></label></div>
      <div className="config-section-box"><h3 className="config-subtitle">Programación</h3><div className="config-grid-3">
        <div><label className="config-label">Tipo</label><select className="config-select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}><option value="completa">Completa</option><option value="incremental">Incremental</option><option value="diferencial">Diferencial</option></select></div>
        <div><label className="config-label">Formato</label><select className="config-select" value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value })}><option value="json">JSON</option><option value="csv">CSV (ZIP)</option><option value="xlsx">Excel (.xlsx)</option><option value="pdf">PDF</option></select></div>
        <div><label className="config-label">Intervalo en minutos</label><input className="config-input" type="number" min="5" max="525600" value={form.intervalo} onChange={(e) => setForm({ ...form, intervalo: Number(e.target.value) })} /><small className="config-help">60 = cada hora, 1440 = diario</small></div>
        <div><label className="config-label">Máximo por tipo</label><input className="config-input" type="number" min="1" max="50" value={form.max_backups} onChange={(e) => setForm({ ...form, max_backups: Number(e.target.value) })} /></div>
      </div></div>
      <div className="config-section-box"><h3 className="config-subtitle">Colecciones incluidas</h3><div className="config-checkbox-grid">{collections.map((name) => <label className="config-check-card" key={name}><input type="checkbox" checked={form.colecciones.includes(name)} onChange={() => toggleCollection(name)} /><span>{name}</span></label>)}</div></div>
      <div className="config-form-footer"><button className="config-btn success" type="submit" disabled={loading}><FiSave /> {loading ? 'Guardando...' : 'Guardar automatización'}</button></div>
      {message && <div className="config-alert">{message}</div>}
    </div>
  </form></section></main>;
}
