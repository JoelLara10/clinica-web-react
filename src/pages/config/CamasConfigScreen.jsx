import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiEdit2, FiRefreshCw, FiSave, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import ConfigHeader from './ConfigHeader';
import api from '../../services/api';
import { getCache, setCache, paginate, pages } from './configCache';
import './ConfigStyles.css';

const CACHE_KEY = 'camas';
const ITEMS_PER_PAGE = 8;
const emptyForm = { numero: '', area: '', tipo: 'General', status: 'LIBRE' };

export default function CamasConfigScreen() {
  const [camas, setCamas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (force = false) => {
    setLoading(true); setMsg('');
    if (!force) { const cached = getCache(CACHE_KEY); if (cached) { setCamas(cached); setLoading(false); return; } }
    try { const res = await api.get('/beds'); const data = Array.isArray(res.data) ? res.data : (res.data?.data || []); setCamas(data); setCache(CACHE_KEY, data); }
    catch (e) { const cached = getCache(CACHE_KEY); if (cached) { setCamas(cached); setMsg('Sin conexión. Se muestran camas en caché.'); } else setMsg(e.response?.data?.error || 'No se pudieron cargar camas.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return camas;
    return camas.filter((c) => `${c.numero || c.num_cama || c.nombre || ''} ${c.area || ''} ${c.tipo || ''} ${c.status || c.estado || c.estatus || ''}`.toLowerCase().includes(q));
  }, [camas, search]);

  const list = paginate(filtered, page, ITEMS_PER_PAGE);
  const totalPages = pages(filtered, ITEMS_PER_PAGE);

  const refresh = async () => { setRefreshing(true); setPage(1); await load(true); setRefreshing(false); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.numero || !form.area) return setMsg('Captura número de cama y área.');
    try {
      if (editingId) await api.put(`/beds/${editingId}`, form);
      else await api.post('/beds', form);
      setForm(emptyForm); setEditingId(null); setMsg(editingId ? 'Cama actualizada.' : 'Cama guardada.'); await load(true);
    } catch (error) { setMsg(error.response?.data?.error || 'No se pudo guardar la cama.'); }
  };

  const edit = (c) => { const id = c.id_cama || c.id || c._id; setEditingId(id); setForm({ numero: c.numero || c.num_cama || c.nombre || '', area: c.area || '', tipo: c.tipo || 'General', status: c.status || c.estado || c.estatus || 'LIBRE' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async (c) => { const id = c.id_cama || c.id || c._id; if (!id) return setMsg('No se encontró ID.'); if (!window.confirm('¿Eliminar cama?')) return; try { await api.delete(`/beds/${id}`); setMsg('Cama eliminada.'); await load(true); } catch (e) { setMsg(e.response?.data?.error || 'No se pudo eliminar la cama.'); } };

  return <main className="config-page"><ConfigHeader title="Gestión de Camas" right={<button className="config-refresh-btn" onClick={refresh}><FiRefreshCw className={refreshing ? 'spin' : ''}/></button>} /><section className="config-content">
    <form className="config-card config-main-card" onSubmit={save}><div className="config-card-header"><h2>{editingId ? 'Editar Cama' : 'Registrar Nueva Cama'}</h2></div><div className="config-card-body"><div className="config-section-box"><h3 className="config-subtitle">🛏️ Datos de la cama</h3><div className="config-grid-2"><div><label className="config-label">Número de cama</label><input className="config-input" value={form.numero} onChange={(e)=>setForm({...form,numero:e.target.value})} placeholder="Ej. 203"/></div><div><label className="config-label">Área</label><input className="config-input" value={form.area} onChange={(e)=>setForm({...form,area:e.target.value})} placeholder="Ej. Urgencias"/></div></div><div className="config-grid-2"><div><label className="config-label">Tipo</label><input className="config-input" value={form.tipo} onChange={(e)=>setForm({...form,tipo:e.target.value})} placeholder="General, Observación, UCI"/></div><div><label className="config-label">Estado</label><select className="config-select" value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}><option value="LIBRE">LIBRE</option><option value="OCUPADA">OCUPADA</option><option value="MANTENIMIENTO">MANTENIMIENTO</option></select></div></div></div><div className="config-form-footer"><button className="config-btn secondary" type="button" onClick={()=>{setForm(emptyForm);setEditingId(null)}}><FiX/>Cancelar</button><button className="config-btn success" type="submit"><FiSave/>{editingId?'Actualizar':'Guardar'} Cama</button></div>{msg&&<div className="config-alert">{msg}</div>}</div></form>
    <h2 className="config-section-title">Camas registradas</h2><div className="config-search"><FiSearch className="config-search-icon"/><input className="config-input" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1)}} placeholder="Buscar cama, área, tipo o estado..."/></div>{loading&&<div className="config-card">Cargando camas...</div>}{!loading&&list.map((c)=><article className="config-card" key={c.id_cama||c.id||c._id||c.numero}><div className="config-row"><div><h3>Cama {c.numero||c.num_cama||c.nombre||'--'}</h3><p>{c.area||'Sin área'} · {c.tipo||'General'}</p></div><span className="config-badge info">{c.status||c.estado||c.estatus||'LIBRE'}</span></div><div className="config-actions"><button className="config-btn warning" onClick={()=>edit(c)}><FiEdit2/>Editar</button><button className="config-btn danger" onClick={()=>remove(c)}><FiTrash2/>Eliminar</button></div></article>)}{!loading&&filtered.length===0&&<div className="config-card">No hay camas registradas.</div>}{filtered.length>ITEMS_PER_PAGE&&<div className="config-pagination"><button className="config-btn secondary" disabled={page===1} onClick={()=>setPage(page-1)}><FiChevronLeft/></button><span className="config-page-pill">{page} / {totalPages}</span><button className="config-btn secondary" disabled={page===totalPages} onClick={()=>setPage(page+1)}><FiChevronRight/></button></div>}
  </section></main>;
}
