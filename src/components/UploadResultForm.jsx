import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiX, FiFile } from 'react-icons/fi';
import api from '../services/api';
import { getCache, setCache, invalidateCachePrefix, removeCache } from '../services/EstudiosCache';
import './UploadResultForm.css';

const CACHE_KEYS = {
  counts: 'estudios_counts',
  examenInfo: (id) => `examen_info_${id}`,
};

export default function UploadResultForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const id_examen = queryParams.get('id_examen');
  const tipo = queryParams.get('tipo') || 'LABORATORIO';
  const pacienteParam = queryParams.get('paciente');
  const habitacionParam = queryParams.get('habitacion');
  const estudiosParam = queryParams.get('estudios');
  const returnSection = queryParams.get('returnSection') || 'solicitudes_lab';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [solicitud, setSolicitud] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [archivos, setArchivos] = useState([]);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!id_examen) {
      setError('Falta el ID del examen');
      setLoading(false);
      return;
    }

    const loadSolicitud = async () => {
      try {
        setLoading(true);
        let data = null;

        if (pacienteParam && habitacionParam && estudiosParam) {
          data = {
            paciente: pacienteParam,
            habitacion: habitacionParam,
            estudios: estudiosParam,
          };
          console.log('📦 Usando datos desde query params');
        } else {
          const cacheKey = CACHE_KEYS.examenInfo(id_examen);
          let cached = await getCache(cacheKey);
          if (cached) {
            data = cached;
            console.log('📦 Usando caché');
          } else {
            console.log('🌐 Cargando desde API');
            const response = await api.get(`/exams/${id_examen}/info`);
            data = response.data;
            await setCache(cacheKey, data);
          }
        }

        setSolicitud(data);
        setError('');
      } catch (err) {
        console.error('Error cargando solicitud:', err);
        setError(`No se pudo cargar la información: ${err.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    loadSolicitud();
  }, [id_examen, pacienteParam, habitacionParam, estudiosParam]);

  const pickDocuments = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    const selectedFiles = Array.from(files).map(file => ({
      file: file,
      name: file.name,
      type: file.type,
      size: file.size,
    }));

    setArchivos(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      const newFiles = selectedFiles.filter(f => !existingNames.has(f.name));
      return [...prev, ...newFiles];
    });

    event.target.value = '';
  };

  const removeFile = (index) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (archivos.length === 0) {
      window.alert('Debe seleccionar al menos un archivo.');
      return;
    }

    const MAX_SIZE = 25 * 1024 * 1024;
    for (const archivo of archivos) {
      if (archivo.size > MAX_SIZE) {
        window.alert(`El archivo "${archivo.name}" excede 25MB.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      archivos.forEach(({ file, name }) => {
        formData.append('archivos', file, name);
      });
      formData.append('observaciones', observaciones);
      formData.append('type', tipo);

      await api.post(`/exams/${id_examen}/results/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      // Invalidar solo cachés de este tipo
      await invalidateCachePrefix(`estudios_all_${tipo}_`);
      await removeCache(CACHE_KEYS.counts);
      await removeCache(CACHE_KEYS.examenInfo(id_examen));

      window.alert('Resultados subidos correctamente.');
      // Navegar de vuelta a la sección que estaba activa
      navigate(`/estudios?initialSection=${returnSection}`);
    } catch (err) {
      console.error('Error al subir:', err);
      let msg = 'Error al subir los resultados.';
      if (err.response?.data?.error) msg = err.response.data.error;
      else if (err.message) msg = err.message;
      window.alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="uf-container uf-centered">
        <div className="uf-spinner"></div>
        <span className="uf-loading-text">Cargando datos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="uf-container uf-centered">
        <div className="uf-error-text">{error}</div>
        <button className="uf-retry-btn" onClick={() => navigate(-1)}>Regresar</button>
      </div>
    );
  }

  return (
    <div className="uf-container">
      <div className="uf-header">
        <button className="uf-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={24} />
        </button>
        <h1 className="uf-header-title">Subir Resultados</h1>
        <div style={{ width: 44 }}></div>
      </div>

      <div className="uf-card">
        <div className="uf-info-row">
          <span className="uf-label">Paciente:</span>
          <span className="uf-value">{solicitud?.paciente || '-'}</span>
        </div>
        <div className="uf-info-row">
          <span className="uf-label">Habitación:</span>
          <span className="uf-value">{solicitud?.habitacion || '-'}</span>
        </div>
        <div className="uf-info-row">
          <span className="uf-label">Estudios:</span>
          <span className="uf-value">{solicitud?.estudios || '-'}</span>
        </div>
      </div>

      <div className="uf-card">
        <div className="uf-section-title">Seleccionar archivos</div>
        <button className="uf-pick-btn" onClick={pickDocuments}>
          <FiUpload /> Seleccionar archivos
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          style={{ display: 'none' }}
        />

        {archivos.length > 0 && (
          <div className="uf-file-list">
            {archivos.map((archivo, index) => (
              <div key={index} className="uf-file-item">
                <FiFile className="uf-file-icon" />
                <span className="uf-file-name">{archivo.name}</span>
                <span className="uf-file-size">
                  {(archivo.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button className="uf-remove-file" onClick={() => removeFile(index)}>
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="uf-hint">Formatos: PDF, PNG, JPG, JPEG (máx 25MB)</div>
      </div>

      <div className="uf-card">
        <div className="uf-section-title">Observaciones</div>
        <textarea
          className="uf-textarea"
          rows="4"
          placeholder="Observaciones relevantes..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>

      <button
        className={`uf-submit-btn ${submitting ? 'disabled' : ''}`}
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <div className="uf-spinner-small"></div>
        ) : (
          <>
            <FiUpload /> Subir Resultados
          </>
        )}
      </button>
    </div>
  );
}