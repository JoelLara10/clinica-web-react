import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiClock, FiPlus, FiSave, FiShield, FiTrash2, FiUser } from 'react-icons/fi';
import { MdMedication } from 'react-icons/md';
import { usePatient } from '../../context/PatientContext';
import api from '../../services/api';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const CACHE_PREFIX = 'ineo_web_cache_medico_prescriptions_';
const CACHE_TTL = 2 * 60 * 1000;

const emptyMedication = (id) => ({
  id,
  medicamento: '',
  dosis: '',
  frecuencia: '',
  duracion: '',
  indicaciones: '',
});

function getCachedValue(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > parsed.ttl) {
      window.localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error('Error reading prescriptions cache:', error);
    return null;
  }
}

function setCachedValue(key, data, ttl = CACHE_TTL) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now(), ttl }));
  } catch (error) {
    console.error('Error saving prescriptions cache:', error);
  }
}

export default function PrescriptionScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPatient } = usePatient();
  const idAtencion = selectedPatient?.id_atencion || location.state?.id_atencion;
  const idExp = selectedPatient?.Id_exp || location.state?.Id_exp;
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [medications, setMedications] = useState([emptyMedication(0)]);

  const patientLabel = useMemo(() => `Exp: ${idExp || 'N/A'} | Atención: ${idAtencion || 'N/A'}`, [idAtencion, idExp]);

  useEffect(() => {
    if (!idAtencion) {
      setErrorMessage('Selecciona un paciente antes de generar una receta médica.');
      return;
    }

    setErrorMessage('');

    const loadHistory = async (forceRefresh = false) => {
      setLoadingHistory(true);
      const cacheKey = String(idAtencion);

      if (!forceRefresh) {
        const cached = getCachedValue(cacheKey);
        if (cached) {
          setHistory(cached);
          setLoadingHistory(false);
          return;
        }
      }

      try {
        const response = await api.get(`/appointments/${idAtencion}/prescriptions`);
        const nextHistory = Array.isArray(response.data) ? response.data : [];
        setCachedValue(cacheKey, nextHistory);
        setHistory(nextHistory);
      } catch (error) {
        console.error('Error loading prescriptions history:', error);
        setHistory(getCachedValue(cacheKey) || []);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [idAtencion]);

  const reloadHistory = async () => {
    if (!idAtencion) return;
    setLoadingHistory(true);
    try {
      const response = await api.get(`/appointments/${idAtencion}/prescriptions`);
      const nextHistory = Array.isArray(response.data) ? response.data : [];
      setCachedValue(String(idAtencion), nextHistory);
      setHistory(nextHistory);
    } catch (error) {
      console.error('Error reloading prescriptions history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const addMedication = () => {
    setMedications((current) => [...current, emptyMedication(Date.now())]);
  };

  const removeMedication = (id) => {
    if (medications.length === 1) {
      window.alert('Debe existir al menos un medicamento en la receta.');
      return;
    }
    setMedications((current) => current.filter((item) => item.id !== id));
  };

  const updateMedication = (id, field, value) => {
    setMedications((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async () => {
    const validMedications = medications.filter((item) => item.medicamento.trim() !== '');
    if (validMedications.length === 0) {
      window.alert('Agrega al menos un medicamento antes de guardar la receta.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/appointments/${idAtencion}/prescriptions`, { medicamentos: validMedications });
      setMedications([emptyMedication(0)]);
      setShowHistory(true);
      await reloadHistory();
    } catch (error) {
      console.error('Error saving prescription:', error);
      window.alert(error.response?.data?.error || 'No se pudo guardar la receta médica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button type="button" onClick={() => navigate(-1)} style={styles.headerButton}><FiArrowLeft size={20} /></button>
        <div>
          <div style={styles.headerEyebrow}>MÉDICO</div>
          <h1 style={styles.headerTitle}>Receta Médica</h1>
        </div>
        <div style={styles.headerSpacer} />
      </div>

      <section style={styles.patientCard}>
        <div style={styles.patientAvatar}><FiUser size={30} color="#fff" /></div>
        <div>
          <h2 style={styles.patientName}>Paciente seleccionado</h2>
          <p style={styles.patientMeta}>{patientLabel}</p>
        </div>
      </section>

      {errorMessage ? <div style={styles.errorCard}>{errorMessage}</div> : null}

      <section style={styles.mainCard}>
        <div style={styles.cardHeader}><MdMedication size={22} /><strong>Nueva Prescripción</strong></div>
        <div style={styles.cardBody}>
          {medications.map((medication, index) => (
            <article key={medication.id} style={styles.medicationCard}>
              <div style={styles.medicationHeader}>
                <div>
                  <div style={styles.medicationTag}>Medicamento #{index + 1}</div>
                  <strong style={styles.medicationTitle}>{medication.medicamento || 'Sin nombre aún'}</strong>
                </div>
                {medications.length > 1 ? (
                  <button type="button" onClick={() => removeMedication(medication.id)} style={styles.deleteButton}>
                    <FiTrash2 size={16} /> Eliminar
                  </button>
                ) : null}
              </div>
              <div style={styles.formGrid}>
                <label style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Medicamento *</span>
                  <input style={styles.fieldInput} value={medication.medicamento} placeholder="Ej: Paracetamol" onChange={(event) => updateMedication(medication.id, 'medicamento', event.target.value)} />
                </label>
                <label style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Dosis</span>
                  <input style={styles.fieldInput} value={medication.dosis} placeholder="Ej: 500 mg" onChange={(event) => updateMedication(medication.id, 'dosis', event.target.value)} />
                </label>
                <label style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Frecuencia</span>
                  <input style={styles.fieldInput} value={medication.frecuencia} placeholder="Ej: Cada 8 horas" onChange={(event) => updateMedication(medication.id, 'frecuencia', event.target.value)} />
                </label>
                <label style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Duración</span>
                  <input style={styles.fieldInput} value={medication.duracion} placeholder="Ej: 7 días" onChange={(event) => updateMedication(medication.id, 'duracion', event.target.value)} />
                </label>
              </div>
              <label style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Indicaciones</span>
                <textarea style={styles.textArea} rows={3} value={medication.indicaciones} placeholder="Indicaciones y observaciones para el paciente..." onChange={(event) => updateMedication(medication.id, 'indicaciones', event.target.value)} />
              </label>
            </article>
          ))}

          <div style={styles.actionsRow}>
            <button type="button" onClick={addMedication} style={styles.secondaryButton}><FiPlus size={18} /> Agregar medicamento</button>
            <button type="button" onClick={handleSubmit} style={styles.primaryButton} disabled={!idAtencion || loading}><FiSave size={18} /> {loading ? 'Guardando...' : 'Guardar receta'}</button>
          </div>
        </div>
      </section>

      <section style={styles.historyCard}>
        <button type="button" style={styles.historyToggle} onClick={() => setShowHistory((current) => !current)}>
          <div style={styles.historyTitleRow}><FiClock size={18} /><strong>Historial de Recetas</strong><span style={styles.historyCount}>{history.length} recetas</span></div>
          {showHistory ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </button>
        {showHistory ? (
          <div style={styles.historyBody}>
            {loadingHistory ? <div style={styles.statusBox}>Cargando historial...</div> : history.length === 0 ? <div style={styles.statusBox}>Aún no hay recetas registradas.</div> : history.map((item, index) => (
              <article key={item.id_receta || `${item.fecha_registro || 'prescription'}-${index}`} style={styles.historyItem}>
                <div style={styles.historyHeader}>
                  <div style={styles.historyBadge}>{moment(item.fecha_registro).format('DD/MM')}</div>
                  <div>
                    <div style={styles.historyDate}>{moment(item.fecha_registro).format('dddd, D [de] MMMM [de] YYYY [a las] HH:mm')}</div>
                    <div style={styles.historyAuthor}>Dr. {item.medico_nombre || 'No especificado'}</div>
                  </div>
                </div>
                <div style={styles.historyList}>
                  {(item.medicamentos || []).map((med, medIndex) => (
                    <div key={`${med.medicamento || 'med'}-${medIndex}`} style={styles.historyMedication}>
                      <div style={styles.historyMedicationName}>{med.medicamento || 'Medicamento sin nombre'}</div>
                      <div style={styles.historyMedicationMeta}>
                        {med.dosis ? <span>Dosis: {med.dosis}</span> : null}
                        {med.frecuencia ? <span>Frecuencia: {med.frecuencia}</span> : null}
                        {med.duracion ? <span>Duración: {med.duracion}</span> : null}
                      </div>
                      {med.indicaciones ? <p style={styles.historyMedicationNotes}>{med.indicaciones}</p> : null}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <footer style={styles.footer}><FiShield size={14} /><span>INEO v2.0 - Prescripción médica</span></footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100%', padding: '24px', background: 'linear-gradient(180deg, #fffaf4 0%, #ffedd5 100%)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '20px 24px', borderRadius: '22px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', boxShadow: '0 18px 50px rgba(234, 88, 12, 0.22)' },
  headerButton: { width: '44px', height: '44px', border: '1px solid rgba(255,255,255,0.24)', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', color: '#fff', display: 'grid', placeItems: 'center' },
  headerEyebrow: { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.18em', opacity: 0.8, marginBottom: '4px' },
  headerTitle: { margin: 0, fontSize: '28px', fontWeight: 800 },
  headerSpacer: { width: '44px', height: '44px' },
  patientCard: { marginTop: '20px', padding: '18px 20px', borderRadius: '20px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)', borderLeft: '5px solid #f97316' },
  patientAvatar: { width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#f97316', display: 'grid', placeItems: 'center' },
  patientName: { margin: 0, color: '#0f172a', fontSize: '18px' },
  patientMeta: { margin: '6px 0 0', color: '#64748b' },
  errorCard: { marginTop: '18px', padding: '16px', borderRadius: '16px', backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412' },
  mainCard: { marginTop: '18px', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 14px 36px rgba(15, 23, 42, 0.08)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 22px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff' },
  cardBody: { padding: '20px' },
  medicationCard: { padding: '18px', marginBottom: '18px', borderRadius: '18px', border: '1px solid #fed7aa', backgroundColor: '#fffaf4' },
  medicationHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  medicationTag: { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', backgroundColor: '#ffedd5', color: '#c2410c', fontWeight: 700, fontSize: '12px', marginBottom: '8px' },
  medicationTitle: { color: '#7c2d12' },
  deleteButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', border: '1px solid #fecaca', backgroundColor: '#fff1f2', color: '#dc2626', fontWeight: 700 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fieldLabel: { color: '#7c2d12', fontWeight: 700 },
  fieldInput: { padding: '12px 14px', borderRadius: '14px', border: '1px solid #fdba74', backgroundColor: '#fff', font: 'inherit', color: '#0f172a' },
  textArea: { width: '100%', minHeight: '110px', padding: '12px 14px', borderRadius: '14px', border: '1px solid #fdba74', backgroundColor: '#fff', resize: 'vertical', font: 'inherit', color: '#0f172a' },
  actionsRow: { display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' },
  secondaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '14px', border: '1px solid #fdba74', backgroundColor: '#fff', color: '#c2410c', fontWeight: 700 },
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', border: 'none', borderRadius: '14px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700 },
  historyCard: { marginTop: '18px', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 14px 36px rgba(15, 23, 42, 0.08)' },
  historyToggle: { width: '100%', border: 'none', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff' },
  historyTitleRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  historyCount: { marginLeft: '8px', padding: '4px 10px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.18)', fontSize: '12px' },
  historyBody: { padding: '16px' },
  statusBox: { padding: '28px', borderRadius: '18px', textAlign: 'center', backgroundColor: '#fff7ed', color: '#9a3412' },
  historyItem: { padding: '16px', borderRadius: '18px', backgroundColor: '#fffaf4', border: '1px solid #fed7aa', marginBottom: '14px' },
  historyHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' },
  historyBadge: { minWidth: '56px', padding: '12px 10px', borderRadius: '14px', backgroundColor: '#f97316', color: '#fff', fontWeight: 800, textAlign: 'center' },
  historyDate: { color: '#7c2d12', fontWeight: 700, marginBottom: '4px' },
  historyAuthor: { color: '#9a3412', fontSize: '13px' },
  historyList: { display: 'grid', gap: '12px' },
  historyMedication: { padding: '14px', borderRadius: '14px', backgroundColor: '#fff', border: '1px solid #ffedd5' },
  historyMedicationName: { color: '#0f172a', fontWeight: 700, marginBottom: '8px' },
  historyMedicationMeta: { display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#7c2d12', fontSize: '13px' },
  historyMedicationNotes: { margin: '10px 0 0', color: '#475569', lineHeight: 1.5 },
  footer: { marginTop: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9a3412', fontSize: '13px' },
};
