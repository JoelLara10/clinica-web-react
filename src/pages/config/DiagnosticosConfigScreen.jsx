import { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiEdit2, FiSave, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import ConfigHeader from './ConfigHeader';
import { paginate, pages, readPermanent, savePermanent } from './configCache';
import './ConfigStyles.css';

const ITEMS_PER_PAGE = 8;
const emptyForm = { clave: '', descripcion: '', tipo: 'General', activo: true };
const seed = [{ id: 'D-001', clave: 'DX-GEN', descripcion: 'Diagnóstico general', tipo: 'General', activo: true }];

export default function DiagnosticosConfigScreen() {
  const [diagnosticos, setDiagnosticos] = useState(() => readPermanent('diagnosticos', seed));
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return diagnosticos;
    return diagnosticos.filter((d) => `${d.clave} ${d.descripcion} ${d.tipo}`.toLowerCase().includes(q));
  }, [diagnosticos, search]);

  const list = paginate(filtered, page, ITEMS_PER_PAGE);
  const totalPages = pages(filtered, ITEMS_PER_PAGE);
  const persist = (data) => { setDiagnosticos(data); savePermanent('diagnosticos', data); };

  const save = (e) => {
    e.preventDefault();
    if (!form.clave || !form.descripcion) return setMsg('Captura clave y descripción.');
    const item = { ...form, id: editId || `D-${Date.now()}` };
    const next = editId ? diagnosticos.map((d) => d.id === editId ? item : d) : [item, ...diagnosticos];
    persist(next); setForm(emptyForm); setEditId(null); setMsg('Diagnóstico guardado en caché.');
  };

  const edit = (d) => { setEditId(d.id); setForm({ ...emptyForm, ...d }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = (id) => { if (!window.confirm('¿Eliminar diagnóstico?')) return; persist(diagnosticos.filter((d) => d.id !== id)); setMsg('Diagnóstico eliminado.'); };

  return <main className="config-page"><ConfigHeader title="Diagnósticos"/><section className="config-content"><form className="config-card config-main-card" onSubmit={save}><div className="config-card-header"><h2>{editId ? 'Editar Diagnóstico' : 'Registrar Diagnóstico'}</h2></div><div className="config-card-body"><div className="config-section-box"><h3 className="config-subtitle">🩺 Datos del diagnóstico</h3><div className="config-grid-2"><div><label className="config-label">Clave</label><input className="config-input" value={form.clave} onChange={(e)=>setForm({...form,clave:e.target.value.toUpperCase()})}/></div><div><label className="config-label">Tipo</label><input className="config-input" value={form.tipo} onChange={(e)=>setForm({...form,tipo:e.target.value})}/></div></div><label className="config-label">Descripción</label><textarea className="config-textarea" value={form.descripcion} onChange={(e)=>setForm({...form,descripcion:e.target.value})}/><label className="config-row"><span>Activo</span><input className="config-switch" type="checkbox" checked={form.activo} onChange={(e)=>setForm({...form,activo:e.target.checked})}/></label></div><div className="config-form-footer"><button className="config-btn secondary" type="button" onClick={()=>{setForm(emptyForm);setEditId(null)}}><FiX/>Cancelar</button><button className="config-btn success" type="submit"><FiSave/>Guardar Diagnóstico</button></div>{msg&&<div className="config-alert success">{msg}</div>}</div></form><h2 className="config-section-title">Catálogo de diagnósticos</h2><div className="config-search"><FiSearch className="config-search-icon"/><input className="config-input" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1)}} placeholder="Buscar diagnóstico..."/></div>{list.map((d)=><article className="config-card" key={d.id}><div className="config-row"><div><h3>{d.clave}</h3><p>{d.descripcion}</p><p>{d.tipo}</p></div><span className={`config-badge ${d.activo?'success':'danger'}`}>{d.activo?'ACTIVO':'INACTIVO'}</span></div><div className="config-actions"><button className="config-btn warning" onClick={()=>edit(d)}><FiEdit2/>Editar</button><button className="config-btn danger" onClick={()=>remove(d.id)}><FiTrash2/>Eliminar</button></div></article>)}{filtered.length>ITEMS_PER_PAGE&&<div className="config-pagination"><button className="config-btn secondary" disabled={page===1} onClick={()=>setPage(page-1)}><FiChevronLeft/></button><span className="config-page-pill">{page} / {totalPages}</span><button className="config-btn secondary" disabled={page===totalPages} onClick={()=>setPage(page+1)}><FiChevronRight/></button></div>}</section></main>;
}
