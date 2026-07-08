import { useEffect, useState } from 'react';
import ConfigHeader from './ConfigHeader';
import { clearConfigCache, createBackup, getConfigSection, resetConfigData } from '../../services/configService';
import './ConfigStyles.css';

export default function BackupConfigScreen() {
  const [respaldos, setRespaldos] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => { getConfigSection('respaldos').then(setRespaldos); }, []);

  const makeBackup = async () => {
    setRespaldos(await createBackup());
    setMsg('Respaldo local creado.');
  };

  const reset = async () => {
    if (!window.confirm('Esto regresará los datos de ejemplo. ¿Continuar?')) return;
    const data = await resetConfigData();
    setRespaldos(data.respaldos);
    setMsg('Datos de ejemplo restaurados.');
  };

  const clear = async () => {
    if (!window.confirm('Esto borrará toda la configuración guardada en caché. ¿Continuar?')) return;
    await clearConfigCache();
    setRespaldos([]);
    setMsg('Caché de configuración eliminada.');
  };

  return (
    <main className="config-page">
      <ConfigHeader title="Copias de Seguridad" />
      <section className="config-content">
        <div className="config-card">
          <h2>💾 Respaldos locales</h2>
          <p>Crea respaldos del módulo de configuración dentro del caché local del navegador.</p>
          <div className="config-actions">
            <button className="config-btn primary" onClick={makeBackup}>Crear respaldo</button>
            <button className="config-btn secondary" onClick={reset}>Restaurar ejemplo</button>
            <button className="config-btn danger" onClick={clear}>Limpiar caché</button>
          </div>
          {msg && <p className="config-cache">{msg}</p>}
        </div>

        <h2 className="config-section-title">Historial</h2>
        {respaldos.length === 0 && <div className="config-card config-empty">No hay respaldos registrados.</div>}
        {respaldos.map((b) => (
          <article className="config-card" key={b.id}>
            <h3>{b.nombre}</h3>
            <p>Tipo: {b.tipo} · Fecha: {new Date(b.fecha).toLocaleString()}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
