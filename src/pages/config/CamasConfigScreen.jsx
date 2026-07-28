import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiEdit2, FiSave, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import ConfigHeader from './ConfigHeader';
import api from '../../services/api';
import { paginate, pages } from './configCache';
import './ConfigStyles.css';

const ITEMS_PER_PAGE = 8;
const emptyForm = { numero: '', area: 'Hospitalizado', tipo_habitacion: 'General', piso: '', seccion: '', ocupada: 0 };
export default function CamasConfigScreen() {
  const [camas, setCamas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/beds');
      setCamas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setMessage(error.response?.data?.error || 'No se pudieron cargar las camas.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return camas;
    return camas.filter((cama) =>
      [cama.id_cama, cama.numero, cama.area, cama.tipo_habitacion, cama.piso, cama.seccion, cama.ocupada ? 'ocupada' : 'libre']
        .join(' ').toLowerCase().includes(query)
    );
  }, [camas, search]);

  const totalPages = pages(filtered, ITEMS_PER_PAGE);
  const visibleBeds = paginate(filtered, Math.min(page, totalPages), ITEMS_PER_PAGE);
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const save = async (event) => {
    event.preventDefault();
    if (!form.numero.trim() || !form.area) return setMessage('El número y el área son obligatorios.');
    const duplicate = camas.some((cama) => cama.numero.toLowerCase() === form.numero.trim().toLowerCase() && cama.id_cama !== editingId);
    if (duplicate) return setMessage('Ya existe una cama con ese número.');

    const payload = { ...form, numero: form.numero.trim(), ocupada: Number(form.ocupada) };
    try {
      if (editingId !== null) await api.put(`/beds/${editingId}`, payload);
      else await api.post('/beds', payload);
      setMessage(editingId !== null ? 'Cama actualizada correctamente.' : 'Cama registrada correctamente.');
      resetForm(); setPage(1); await load();
    } catch (error) {
      setMessage(error.response?.data?.error || 'No se pudo guardar la cama.');
    }
  };

  const edit = (cama) => {
    setEditingId(cama.id_cama);
    setForm({ ...emptyForm, ...cama, ocupada: Number(cama.ocupada) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (cama) => {
    if (cama.ocupada) return setMessage('No se puede eliminar una cama ocupada.');
    if (!window.confirm(`¿Eliminar la cama ${cama.numero}?`)) return;
    try {
      await api.delete(`/beds/${cama.id_cama}`);
      setMessage('Cama eliminada correctamente.');
      await load();
    } catch (error) {
      setMessage(error.response?.data?.error || 'No se pudo eliminar la cama.');
    }
  };

  return (
    <main className="config-page">
      <ConfigHeader title="Gestión de Camas" />
      <section className="config-content">
        <form className="config-card config-main-card" onSubmit={save}>
          <div className="config-card-header"><h2>{editingId !== null ? 'Editar cama' : 'Registrar nueva cama'}</h2></div>
          <div className="config-card-body">
            <div className="config-section-box">
              <h3 className="config-subtitle">Datos de la cama</h3>
              <div className="config-grid-3">
                <div><label className="config-label">Número</label><input className="config-input" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="Ej. H-101" required /></div>
                <div><label className="config-label">Área</label><select className="config-select" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}><option>Hospitalizado</option><option>Urgencias</option></select></div>
                <div><label className="config-label">Tipo de habitación</label><select className="config-select" value={form.tipo_habitacion} onChange={(e) => setForm({ ...form, tipo_habitacion: e.target.value })}><option>General</option><option>Observación</option><option>Terapia intensiva</option><option>Recuperación</option><option>Consulta</option></select></div>
                <div><label className="config-label">Piso</label><input className="config-input" value={form.piso} onChange={(e) => setForm({ ...form, piso: e.target.value })} placeholder="Ej. 1" /></div>
                <div><label className="config-label">Sección</label><input className="config-input" value={form.seccion} onChange={(e) => setForm({ ...form, seccion: e.target.value })} placeholder="Ej. A" /></div>
                <div><label className="config-label">Estado</label><select className="config-select" value={form.ocupada} onChange={(e) => setForm({ ...form, ocupada: Number(e.target.value) })}><option value={0}>Libre</option><option value={1}>Ocupada</option></select></div>
              </div>
            </div>
            <div className="config-form-footer">
              <button className="config-btn secondary" type="button" onClick={resetForm}><FiX /> Cancelar</button>
              <button className="config-btn success" type="submit"><FiSave /> {editingId !== null ? 'Actualizar' : 'Guardar'} cama</button>
            </div>
            {message && <div className="config-alert">{message}</div>}
          </div>
        </form>

        <div className="config-list-heading">
          <div><h2 className="config-section-title">Camas registradas</h2><p className="config-muted">{filtered.length} cama(s)</p></div>
          <div className="config-search"><FiSearch className="config-search-icon" /><input className="config-input" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar cama, área o sección..." /></div>
        </div>

        {loading && <div className="config-card">Cargando camas...</div>}
        {!loading && <div className="config-table-wrap">
          <table className="config-table">
            <thead><tr><th>ID</th><th>Número</th><th>Área</th><th>Habitación</th><th>Piso</th><th>Sección</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{visibleBeds.map((cama) => <tr key={cama.id_cama}>
              <td>{cama.id_cama}</td><td><strong>{cama.numero}</strong></td><td>{cama.area}</td><td>{cama.tipo_habitacion || 'N/A'}</td><td>{cama.piso || 'N/A'}</td><td>{cama.seccion || 'N/A'}</td>
              <td><span className={`config-badge ${cama.ocupada ? 'danger' : 'success'}`}>{cama.ocupada ? 'OCUPADA' : 'LIBRE'}</span></td>
              <td><div className="config-actions compact"><button className="config-btn warning icon-only" type="button" title="Editar" onClick={() => edit(cama)}><FiEdit2 /></button><button className="config-btn danger icon-only" type="button" title="Eliminar" onClick={() => remove(cama)}><FiTrash2 /></button></div></td>
            </tr>)}</tbody>
          </table>
          {!visibleBeds.length && <div className="config-empty">No hay camas que coincidan con la búsqueda.</div>}
        </div>}
        {filtered.length > ITEMS_PER_PAGE && <div className="config-pagination"><button className="config-btn secondary" type="button" disabled={page === 1} onClick={() => setPage(page - 1)}><FiChevronLeft /></button><span className="config-page-pill">{page} / {totalPages}</span><button className="config-btn secondary" type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)}><FiChevronRight /></button></div>}
      </section>
    </main>
  );
}
