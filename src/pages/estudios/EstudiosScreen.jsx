import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  getCache,
  setCache,
  removeCache,
  invalidateCachePrefix,
  CacheKeys,
} from '../../services/EstudiosCache';
import Pagination from '../../components/Pagination';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiUpload,
  FiEye,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi';
import { FaFlask, FaChartBar, FaClipboardList, FaFolderOpen } from 'react-icons/fa';
import './EstudiosScreen.css';

const SECTIONS = [
  { id: 'solicitudes_lab', label: 'Solicitudes Lab', icon: <FaFlask /> },
  { id: 'solicitudes_gab', label: 'Solicitudes Gab', icon: <FaChartBar /> },
  { id: 'resultados_lab', label: 'Resultados Lab', icon: <FaClipboardList /> },
  { id: 'resultados_gab', label: 'Resultados Gab', icon: <FaFolderOpen /> },
];

const SECTION_CONFIG = {
  solicitudes_lab: { endpoint: '/pending', type: 'LABORATORIO', isPending: true },
  solicitudes_gab: { endpoint: '/pending', type: 'GABINETE', isPending: true },
  resultados_lab: { endpoint: '/completed', type: 'LABORATORIO', isPending: false },
  resultados_gab: { endpoint: '/completed', type: 'GABINETE', isPending: false },
};

const PAGE_SIZE = 5;
const FETCH_ALL_LIMIT = 9999;

export default function EstudiosScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const initialSection = queryParams.get('initialSection');

  const [selectedSection, setSelectedSection] = useState(
    initialSection && SECTION_CONFIG[initialSection] ? initialSection : 'solicitudes_lab'
  );
  const [allItems, setAllItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [counts, setCounts] = useState({ laboratorio: 0, gabinete: 0, total: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const initialLoadDone = useRef(false);
  const skipFocusRefresh = useRef(false);

  const normalizeItem = (item = {}) => ({
    id_examen: item.id_examen ?? item._id ?? '',
    paciente:
      typeof item.paciente === 'string'
        ? item.paciente
        : item.paciente?.nombre || item.nombre_paciente || 'Paciente',
    medico:
      typeof item.medico === 'string'
        ? item.medico
        : item.medico?.nombre || item.nombre_medico || 'No asignado',
    estudios: Array.isArray(item.estudios)
      ? item.estudios.join(', ')
      : item.estudios || 'Sin estudios',
    fecha: item.fecha_solicitud || item.fecha || null,
    fecha_realizado: item.fecha_realizado || null,
    habitacion: item.habitacion || item.numero_habitacion || item.cama || 'Sin información',
  });

  const loadAllData = useCallback(
    async (force = false) => {
      const config = SECTION_CONFIG[selectedSection];
      if (!config) {
        setAllItems([]);
        setError('Sección inválida');
        return;
      }

      const cacheKey = CacheKeys.estudiosAll(
        config.type,
        config.isPending ? 'pending' : 'completed'
      );

      try {
        setLoading(true);
        setError('');

        let data = null;
        if (!force) {
          const cached = await getCache(cacheKey);
          if (cached) {
            data = cached;
            console.log(`📦 Carga desde caché: ${cacheKey}`);
          }
        }

        if (!data) {
          console.log(`🌐 Cargando desde API para ${selectedSection}...`);
          const response = await api.get(`/exams${config.endpoint}`, {
            params: {
              type: config.type,
              page: 1,
              limit: FETCH_ALL_LIMIT,
            },
          });
          data = Array.isArray(response.data) ? response.data : [];
          await setCache(cacheKey, data);
          console.log(`💾 Guardado en caché: ${cacheKey} (${data.length} registros)`);
        }

        let normalized = data.map(normalizeItem);
        normalized.sort((a, b) => {
          const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
          const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
          return dateB - dateA;
        });

        setAllItems(normalized);
        setCurrentPage(1);
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'No se pudieron cargar los estudios.';
        setError(errorMsg);
        setAllItems([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedSection]
  );

  const loadCounts = useCallback(
    async (force = false) => {
      try {
        if (!force) {
          const cached = await getCache(CacheKeys.counts);
          if (cached) {
            setCounts(cached);
            return;
          }
        }
        const response = await api.get('/exams/counts');
        const counts = {
          laboratorio: response.data?.laboratorio ?? 0,
          gabinete: response.data?.gabinete ?? 0,
          total: response.data?.total ?? 0,
        };
        setCounts(counts);
        await setCache(CacheKeys.counts, counts);
      } catch (error) {
        console.error('Error loading counts:', error);
      }
    },
    []
  );

  useEffect(() => {
    skipFocusRefresh.current = false;
    loadAllData();
    loadCounts();
    initialLoadDone.current = true;
  }, [selectedSection, loadAllData, loadCounts]);

  const onRefresh = async () => {
    setRefreshing(true);
    skipFocusRefresh.current = true;
    // Forzar recarga de todas las claves (refresco manual)
    await invalidateCachePrefix('estudios_all_');
    await removeCache(CacheKeys.counts);
    await Promise.all([loadAllData(true), loadCounts(true)]);
    setRefreshing(false);
    skipFocusRefresh.current = false;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleUpload = (item) => {
    const tipo = selectedSection.includes('lab') ? 'LABORATORIO' : 'GABINETE';
    skipFocusRefresh.current = false;
    
    const params = new URLSearchParams({
      id_examen: item.id_examen,
      tipo: tipo,
      paciente: item.paciente,
      habitacion: item.habitacion,
      estudios: item.estudios,
      returnSection: selectedSection,
    });
    
    navigate(`/subir-resultado?${params.toString()}`);
  };

  const handleView = (id_examen) => {
    const tipo = selectedSection.includes('lab') ? 'LABORATORIO' : 'GABINETE';
    const screen = tipo === 'LABORATORIO' ? 'ver-resultado-lab' : 'ver-resultado-gab';
    navigate(`/${screen}?id_examen=${id_examen}&tipo=${tipo}`);
  };

  const handleEdit = (id_examen) => {
    const tipo = selectedSection.includes('lab') ? 'LABORATORIO' : 'GABINETE';
    const screen = tipo === 'LABORATORIO' ? 'editar-resultado-lab' : 'editar-resultado-gab';
    navigate(`/${screen}?id_examen=${id_examen}&tipo=${tipo}&returnSection=${selectedSection}`);
  };

  const handleDelete = (id_examen) => {
    const tipo = selectedSection.includes('lab') ? 'laboratorio' : 'gabinete';
    if (!window.confirm(`¿Estás seguro de eliminar este resultado de ${tipo}?`)) return;

    if (deleting) return;
    setDeleting(true);

    (async () => {
      try {
        await api.delete(`/exams/${id_examen}/results?type=${tipo}`);

        alert(`✅ Resultado de ${tipo} eliminado correctamente.`);

        // Invalidar solo este tipo
        const tipoUpper = tipo.toUpperCase();
        await invalidateCachePrefix(`estudios_all_${tipoUpper}_`);
        await removeCache(CacheKeys.counts);

        await Promise.all([
          loadAllData(true),
          loadCounts(true),
        ]);
      } catch (error) {
        console.error('Error al eliminar:', error);
        let msg = 'Error al eliminar el resultado. Intenta de nuevo.';
        if (error.response?.data?.error) {
          msg = error.response.data.error;
        }
        alert(msg);
      } finally {
        setDeleting(false);
      }
    })();
  };

  const isPending = selectedSection.startsWith('solicitudes');

  const getPaginatedItems = () => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return allItems.slice(start, end);
  };

  const totalPages = Math.ceil(allItems.length / PAGE_SIZE);
  const paginatedItems = getPaginatedItems();

  const renderItem = (item) => (
    <div className="est-card" key={item.id_examen}>
      <div className="est-card-header">
        <div className="est-avatar">{String(item.paciente).charAt(0)}</div>
        <div className="est-card-info">
          <div className="est-patient-name">{item.paciente}</div>
          <div className="est-patient-detail">🛏️ {item.habitacion}</div>
        </div>
        {!isPending && <div className="est-completed-badge">✅</div>}
      </div>

      <div className="est-card-body">
        <div className="est-info-row">
          <span className="est-info-icon">🔬</span>
          <span className="est-exams-list">{item.estudios}</span>
        </div>
        <div className="est-info-row">
          <span className="est-info-icon">📅</span>
          <span className="est-date-text">
            Solicitado: {item.fecha ? new Date(item.fecha).toLocaleDateString() : 'Fecha no disponible'}
          </span>
        </div>
        {!isPending && item.fecha_realizado && (
          <div className="est-info-row">
            <span className="est-info-icon">✅</span>
            <span className="est-date-text">
              Realizado: {new Date(item.fecha_realizado).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="est-action-row">
        {isPending ? (
          <button className="est-btn est-btn-upload" onClick={() => handleUpload(item)}>
            <FiUpload /> Subir
          </button>
        ) : (
          <>
            <button className="est-btn est-btn-view" onClick={() => handleView(item.id_examen)}>
              <FiEye /> Ver
            </button>
            <button className="est-btn est-btn-edit" onClick={() => handleEdit(item.id_examen)}>
              <FiEdit /> Editar
            </button>
            <button 
              className="est-btn est-btn-delete" 
              onClick={() => handleDelete(item.id_examen)}
              disabled={deleting}
            >
              <FiTrash2 /> Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderEmpty = () => (
    <div className="est-empty">
      <div className="est-empty-emoji">📭</div>
      <div className="est-empty-text">
        {isPending ? 'No hay solicitudes pendientes' : 'No hay resultados registrados'}
      </div>
      <div className="est-empty-subtext">
        {isPending ? 'Todos los estudios están completados' : 'Aún no se han subido resultados'}
      </div>
    </div>
  );

  return (
    <div className="est-container">
      <div className="est-header">
        <button className="est-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h1 className="est-header-title">🔬 Módulo de Estudios</h1>
        <button className="est-refresh-btn" onClick={onRefresh} disabled={refreshing}>
          <FiRefreshCw className={refreshing ? 'est-spin' : ''} />
        </button>
      </div>

      <div className="est-stats">
        <div className="est-stat-box">
          <span className="est-stat-emoji">🧪</span>
          <span className="est-stat-number">{counts.laboratorio}</span>
          <span className="est-stat-label">Laboratorio</span>
        </div>
        <div className="est-stat-box">
          <span className="est-stat-emoji">📊</span>
          <span className="est-stat-number">{counts.gabinete}</span>
          <span className="est-stat-label">Gabinete</span>
        </div>
        <div className="est-stat-box">
          <span className="est-stat-emoji">⚠️</span>
          <span className="est-stat-number">{counts.total}</span>
          <span className="est-stat-label">Total Pendientes</span>
        </div>
      </div>

      <div className="est-tabs-wrapper">
        <div className="est-tabs">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`est-tab ${selectedSection === section.id ? 'est-tab-active' : ''}`}
              onClick={() => {
                setSelectedSection(section.id);
                skipFocusRefresh.current = true;
              }}
            >
              <span className="est-tab-icon">{section.icon}</span>
              <span className="est-tab-label">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="est-list-area">
        {error ? (
          <div className="est-empty">
            <div className="est-empty-emoji">⚠️</div>
            <div className="est-empty-text">{error}</div>
          </div>
        ) : loading && allItems.length === 0 ? (
          <div className="est-loading">
            <div className="est-spinner"></div>
            <div>Cargando estudios...</div>
          </div>
        ) : allItems.length === 0 ? (
          renderEmpty()
        ) : (
          <>
            <div className="est-list">
              {paginatedItems.map((item) => renderItem(item))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={PAGE_SIZE}
                totalItems={allItems.length}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}