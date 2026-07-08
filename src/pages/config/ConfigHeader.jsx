import { useNavigate } from 'react-router-dom';
import './ConfigStyles.css';

export default function ConfigHeader({ title }) {
  const navigate = useNavigate();
  return (
    <header className="config-header">
      <button className="config-back" onClick={() => navigate(-1)}>←</button>
      <h1>{title}</h1>
      <span style={{ width: 42 }} />
    </header>
  );
}
