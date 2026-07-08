import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { invalidateCachePrefix, removeCache } from '../services/EstudiosCache';
import './EditResultForm.css';

const CACHE_KEYS = {
  counts: 'estudios_counts',
  examenInfo: (id) => `examen_info_${id}`,
};

export default function EditResultForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const id_examen = queryParams.get('id_examen');
  const tipo = queryParams.get('tipo') || 'LABORATORIO';
  const returnSection = queryParams.get('returnSection') || 'resultados_lab';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState({
    paciente: '',
    habitacion: '',
    archivos: [],
    observaciones: '',
  });
  const [nuevosArchivos, setNuevosArchivos] = useState([]);
  const [archivosAEliminar, setArchivosAEliminar] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInfo = async () => {
      if (!id_examen) {
        setError('Falta el ID del examen');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/exams/${id_examen}/edit-info?type=${tipo}`);
        const data = response.data;

        setInfo({
          paciente: data.paciente || '',
          habitacion: data.habitacion || '',
          archivos: data.archivos || [],
          observaciones: data.observaciones || '',
        });

        const eliminarState = {};
        (data.archivos || []).forEach((nombre) => {
          eliminarState[nombre] = false;
        });
        setArchivosAEliminar(eliminarState);
        setError('');
      } catch (err) {
        console.error('Error cargando info:', err);
        setError('No se pudo cargar la información.');
      } finally {
        setLoading(false);
      }
    };

    loadInfo();
  }, [id_examen, tipo]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const MAX_SIZE = 25 * 1024 * 1024;
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];

    const newFiles = files
      .filter((file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!validExtensions.includes(ext)) {
          alert(`El archivo "${file.name}" tiene formato no permitido.`);
          return false;
        }
        if (file.size > MAX_SIZE) {
          alert(`El archivo "${file.name}" excede 25MB.`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        id: `${file.name}_${file.size}_${Date.now()}`,
      }));

    setNuevosArchivos((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeNuevoArchivo = (id) => {
    setNuevosArchivos((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleEliminar = (nombre) => {
    setArchivosAEliminar((prev) => ({
      ...prev,
      [nombre]: !prev[nombre],
    }));
  };

  const handleSubmit = async () => {
    const archivosExistentes = info.archivos.filter(
      (nombre) => !archivosAEliminar[nombre]
    );

    if (archivosExistentes.length === 0 && nuevosArchivos.length === 0) {
      alert('Debe mantener al menos un archivo o agregar uno nuevo.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      nuevosArchivos.forEach((item) => {
        formData.append('archivos', item.file, item.file.name);
      });

      const eliminarList = Object.keys(archivosAEliminar).filter(
        (nombre) => archivosAEliminar[nombre]
      );
      eliminarList.forEach((nombre) => {
        formData.append('eliminar_archivos', nombre);
      });

      formData.append('observaciones', info.observaciones);
      formData.append('type', tipo);

      await api.put(`/exams/${id_examen}/edit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      // Invalidar solo cachés de este tipo
      await invalidateCachePrefix(`estudios_all_${tipo}_`);
      await removeCache(CACHE_KEYS.counts);
      await removeCache(CACHE_KEYS.examenInfo(id_examen));

      alert('Cambios guardados correctamente.');
      navigate(`/estudios?initialSection=${returnSection}`);
    } catch (err) {
      console.error('Error al actualizar:', err);
      let msg = 'Error al actualizar los resultados.';
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.message) {
        msg = err.message;
      }
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="er-centered">
        <div className="er-spinner"></div>
        <p className="er-loading-text">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="er-centered">
        <p className="er-error-text">{error}</p>
        <button className="er-retry-btn" onClick={() => navigate(-1)}>
          Regresar
        </button>
      </div>
    );
  }

  return (
    <div className="er-container">
      <div className="er-header">
        <button className="er-back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="er-header-title">Editar Resultados</h1>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="er-content">
        <div className="er-card">
          <div className="er-info-row">
            <span className="er-label">Paciente:</span>
            <span className="er-value">{info.paciente}</span>
          </div>
          <div className="er-info-row">
            <span className="er-label">Habitación:</span>
            <span className="er-value">{info.habitacion}</span>
          </div>
        </div>

        <div className="er-card">
          <h3 className="er-section-title">Archivos existentes</h3>
          {info.archivos.length === 0 ? (
            <p className="er-empty-text">No hay archivos registrados.</p>
          ) : (
            <ul className="er-file-list">
              {info.archivos.map((nombre) => (
                <li key={nombre} className="er-file-item">
                  <span className="er-file-name">{nombre}</span>
                  <label className="er-switch-label">
                    <input
                      type="checkbox"
                      checked={archivosAEliminar[nombre] || false}
                      onChange={() => toggleEliminar(nombre)}
                    />
                    <span>Eliminar</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="er-card">
          <h3 className="er-section-title">Agregar nuevos archivos</h3>
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="er-file-input"
          />
          {nuevosArchivos.length > 0 && (
            <ul className="er-file-list">
              {nuevosArchivos.map((item) => (
                <li key={item.id} className="er-file-item">
                  <span className="er-file-name">📄 {item.name}</span>
                  <span className="er-file-size">
                    {(item.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    className="er-remove-btn"
                    onClick={() => removeNuevoArchivo(item.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="er-hint">Formatos: PDF, PNG, JPG, JPEG (máx 25MB)</p>
        </div>

        <div className="er-card">
          <h3 className="er-section-title">Observaciones</h3>
          <textarea
            className="er-textarea"
            rows="4"
            placeholder="Observaciones relevantes..."
            value={info.observaciones}
            onChange={(e) => setInfo({ ...info, observaciones: e.target.value })}
          />
        </div>

        <button
          className={`er-submit-btn ${submitting ? 'er-disabled' : ''}`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <span className="er-spinner-small"></span>
          ) : (
            '💾 Guardar Cambios'
          )}
        </button>
      </div>
    </div>
  );
}