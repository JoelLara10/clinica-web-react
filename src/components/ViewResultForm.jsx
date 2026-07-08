import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiEye, FiFolder, FiFile } from 'react-icons/fi';
import api from '../services/api';
import './ViewResultForm.css';

export default function ViewResultForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id_examen = queryParams.get('id_examen');
  const tipo = queryParams.get('tipo') || 'LABORATORIO';

  const [loading, setLoading] = useState(true);
  const [archivos, setArchivos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  // Obtener la URL base del servidor (sin /api/v1)
  const baseUrl = api.defaults.baseURL?.replace('/api/v1', '') || '';

  useEffect(() => {
    const loadFiles = async () => {
      if (!id_examen) {
        setError('Falta el ID del examen');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/exams/${id_examen}/files`, {
          params: { type: tipo },
        });
        setArchivos(response.data);
        if (response.data.length > 0) {
          setSelectedFile(response.data[0]);
        }
        setError('');
      } catch (err) {
        console.error('Error cargando archivos:', err);
        setError('No se pudieron cargar los archivos.');
      } finally {
        setLoading(false);
      }
    };
    loadFiles();
  }, [id_examen, tipo]);

  const handleSelectFile = (file) => {
    setSelectedFile(file);
  };

  // Renderizado de la vista previa
  const renderPreview = () => {
    if (!selectedFile) {
      return (
        <div className="vr-preview-placeholder">
          <FiFile size={64} color="#cbd5e0" />
          <p className="vr-placeholder-text">Selecciona un archivo</p>
          <p className="vr-placeholder-subtext">
            Haz clic en un archivo de la lista para previsualizarlo
          </p>
        </div>
      );
    }

    const ext = selectedFile.tipo?.toLowerCase();
    const fileUrl = `${baseUrl}${selectedFile.url}`;

    if (ext === 'pdf') {
      return (
        <div className="vr-pdf-preview">
          <div className="vr-pdf-icon-wrapper">
            <FiFile size={80} color="#667eea" />
          </div>
          <p className="vr-pdf-name">{selectedFile.nombre}</p>
          <div className="vr-pdf-badge">PDF</div>
          <p className="vr-pdf-info">Vista previa solo para visualización</p>
        </div>
      );
    } else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
      return (
        <div className="vr-image-container">
          <img
            src={fileUrl}
            alt={selectedFile.nombre}
            className="vr-preview-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
            }}
          />
        </div>
      );
    } else {
      return (
        <div className="vr-preview-placeholder">
          <FiFile size={48} color="#a0aec0" />
          <p className="vr-placeholder-text">Formato no soportado</p>
          <p className="vr-placeholder-subtext">
            No se puede mostrar vista previa de este tipo de archivo.
          </p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="vr-centered">
        <div className="vr-spinner"></div>
        <p className="vr-loading-text">Cargando archivos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vr-centered">
        <FiFile size={48} color="#e53e3e" />
        <p className="vr-error-text">{error}</p>
        <button className="vr-retry-btn" onClick={() => navigate(-1)}>
          Regresar
        </button>
      </div>
    );
  }

  return (
    <div className="vr-container">
      {/* Header */}
      <div className="vr-header">
        <button className="vr-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={28} />
        </button>
        <h1 className="vr-header-title">Ver Resultados</h1>
        <div style={{ width: 44 }}></div>
      </div>

      <div className="vr-main">
        {/* Lista de archivos */}
        <div className="vr-list-container">
          <div className="vr-section-header">
            <FiFolder size={20} color="#4a5568" />
            <span className="vr-section-title">Archivos disponibles</span>
            <span className="vr-badge">{archivos.length}</span>
          </div>
          <div className="vr-file-list">
            {archivos.length === 0 ? (
              <p className="vr-empty-text">No hay archivos registrados.</p>
            ) : (
              archivos.map((file, index) => (
                <button
                  key={index}
                  className={`vr-file-item ${
                    selectedFile?.nombre === file.nombre ? 'vr-active' : ''
                  }`}
                  onClick={() => handleSelectFile(file)}
                >
                  <span className="vr-file-icon">
                    {file.tipo === 'pdf' ? '📄' : '🖼️'}
                  </span>
                  <span className="vr-file-name">{file.nombre}</span>
                  <span className="vr-file-badge">{file.tipo.toUpperCase()}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Vista previa */}
        <div className="vr-preview-container">
          <div className="vr-section-header">
            <FiEye size={20} color="#4a5568" />
            <span className="vr-section-title">Vista previa</span>
          </div>
          <div className="vr-preview-box">{renderPreview()}</div>
        </div>
      </div>
    </div>
  );
}