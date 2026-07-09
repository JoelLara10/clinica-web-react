import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './ConfigStyles.css';

export default function ConfigHeader({ title = 'Configuración', right = null, showBack = true }) {
  const navigate = useNavigate();

  return (
    <header className="config-header-modern">
      <div className="config-header-left">
        {showBack && (
          <button className="config-back-btn" type="button" onClick={() => navigate(-1)}>
            <FiArrowLeft />
          </button>
        )}
      </div>
      <h1 className="config-title">{title}</h1>
      <div>{right}</div>
    </header>
  );
}
