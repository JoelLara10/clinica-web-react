import { useCallback, useEffect, useState } from 'react';
import { FiDatabase, FiDownload, FiRefreshCw, FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import ConfigHeader from './ConfigHeader';
import backupService from '../../services/backupService';
import './ConfigStyles.css';
import './BackupStyles.css';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
};

export default function BackupConfigScreen() {
  const [backups, setBackups] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selected, setSelected] = useState([]);
  const [type, setType] = useState('completa');
  const [format, setFormat] = useState('json');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const [health, setHealth] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [backupList, collectionList, dbHealth] = await Promise.all([
        backupService.list(), backupService.collections(), backupService.health(),
      ]);
      setBackups(backupList);
      setCollections(collectionList);
      setSelected(collectionList);
      setHealth(dbHealth);
    } catch (error) {
      setMessage(error.response?.data?.error || 'No se pudo cargar la información de respaldos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleCollection = (name) => setSelected((current) =>
    current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
  );

  const create = async () => {
    if (!selected.length) return setMessage('Selecciona al menos una colección.');
    setWorking(true);
    try {
      const result = await backupService.create({
        tipo: type,
        formato: format,
        colecciones: selected,
      });
      setMessage(result.message);
      setBackups(await backupService.list());
    } catch (error) {
      setMessage(error.response?.data?.error || 'No se pudo crear el respaldo.');
    } finally { setWorking(false); }
  };

  const restore = async (backup) => {
    if (!window.confirm(`La restauración reemplazará los datos incluidos en ${backup.filename}. ¿Continuar?`)) return;
    setWorking(true);
    try {
      const result = await backupService.restore(backup.filename);
      setMessage(`${result.message}. Colecciones: ${result.collections.join(', ')}`);
    } catch (error) {
      const data = error.response?.data;
      const failed = data?.failed_collections
        ?.map((item) => `${item.collection}: ${item.error}`)
        .join(' | ');
      setMessage(failed
        ? `${data.error} Colecciones restauradas: ${data.collections?.join(', ') || 'ninguna'}. Detalle: ${failed}`
        : data?.error || 'No se pudo restaurar el respaldo.');
    } finally { setWorking(false); }
  };

  const remove = async (backup) => {
    if (!window.confirm(`¿Eliminar ${backup.filename}?`)) return;
    try {
      const result = await backupService.remove(backup.filename);
      setMessage(result.message);
      setBackups(await backupService.list());
    } catch (error) {
      setMessage(error.response?.data?.error || 'No se pudo eliminar el respaldo.');
    }
  };

  return <main className="config-page"><ConfigHeader title="Copias de Seguridad" right={<button className="config-refresh-btn" type="button" onClick={load}><FiRefreshCw /></button>} /><section className="config-content">
    <div className="config-card config-main-card"><div className="config-card-header"><FiDatabase size={26} /><h2>Crear respaldo de MongoDB</h2></div><div className="config-card-body">
      <div className="config-section-box"><div className="config-grid-3"><div><label className="config-label">Tipo de respaldo</label><select className="config-select" value={type} onChange={(e) => setType(e.target.value)}><option value="completa">Completa</option><option value="incremental">Incremental</option><option value="diferencial">Diferencial</option></select></div><div><label className="config-label">Formato</label><select className="config-select" value={format} onChange={(e) => setFormat(e.target.value)}><option value="json">JSON</option><option value="csv">CSV (ZIP)</option><option value="xlsx">Excel (.xlsx)</option><option value="pdf">PDF</option></select></div><div><label className="config-label">Estado de MongoDB</label><span className={`config-badge ${health?.status === 'ok' ? 'success' : 'danger'}`}>{health?.message || 'Verificando...'}</span></div></div>
        <p className="config-help">{type === 'completa' ? 'Incluye todos los documentos seleccionados.' : type === 'incremental' ? 'Incluye cambios posteriores a la última copia realizada.' : 'Incluye cambios posteriores a la última copia completa.'} {format === 'pdf' ? 'El PDF es solo de consulta y no se puede restaurar.' : ''}</p>
        <h3 className="config-subtitle config-backup-collections-title">Colecciones incluidas</h3><div className="config-checkbox-grid">{collections.map((name) => <label className="config-check-card" key={name}><input type="checkbox" checked={selected.includes(name)} onChange={() => toggleCollection(name)} /><span>{name}</span></label>)}</div>
      </div>
      <div className="config-form-footer"><button className="config-btn success" type="button" disabled={working} onClick={create}><FiDatabase /> {working ? 'Procesando...' : 'Crear respaldo'}</button></div>
      {message && <div className="config-alert">{message}</div>}
    </div></div>
    <h2 className="config-section-title">Respaldos disponibles</h2>
    {loading && <div className="config-card">Cargando respaldos...</div>}
    {!loading && backups.length === 0 && <div className="config-card">Aún no hay respaldos.</div>}
    {backups.map((backup) => <article className="config-card" key={backup.filename}><div className="config-row"><div><h3>{backup.filename}</h3><p>{new Date(backup.date).toLocaleString('es-MX')} · {formatBytes(backup.size)}</p><div className="config-backup-tags"><span className="config-badge info">{backup.type}</span><span className="config-badge info">{backup.format === 'xlsx' ? 'EXCEL' : backup.format}</span>{!backup.restorable && <span className="config-badge warn">SOLO CONSULTA</span>}</div></div><span className={`config-badge ${backup.automatic ? 'info' : 'success'}`}>{backup.automatic ? 'AUTOMÁTICO' : 'MANUAL'}</span></div><div className="config-actions"><button className="config-btn secondary" type="button" onClick={() => backupService.download(backup.filename)}><FiDownload /> Descargar</button><button className="config-btn warning" type="button" disabled={working || !backup.restorable} title={backup.restorable ? 'Restaurar respaldo' : 'Los PDF no se pueden restaurar'} onClick={() => restore(backup)}><FiRotateCcw /> Restaurar</button><button className="config-btn danger" type="button" onClick={() => remove(backup)}><FiTrash2 /> Eliminar</button></div></article>)}
  </section></main>;
}
