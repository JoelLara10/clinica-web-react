import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import './LoginScreen.css';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor ingresa usuario y contraseña');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const result = await login(username, password);
    setLoading(false);
    if (!result.success) setErrorMsg(result.error || 'Credenciales incorrectas');
    // ✅ La navegación la maneja el router automáticamente cuando user cambia
  };

  return (
    <div className="login-container">
      {/* Brand */}
      <div className="brand-container">
        <div className="icon-container">
          <MdLocalHospital size={70} color="#fff" />
        </div>
        <h1 className="brand-title">INEO</h1>
        <p className="brand-subtitle">Sistema de Gestión Hospitalaria</p>
      </div>

      {/* Form */}
      <div className="form-container">
        <div className="input-group">
          <FiUser size={22} color="#667eea" />
          <input
            className="input"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoComplete="username"
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <FiLock size={22} color="#667eea" />
          <input
            className="input"
            placeholder="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoComplete="current-password"
            disabled={loading}
          />
          <button className="eye-btn" onClick={() => setShowPassword(!showPassword)} type="button">
            {showPassword ? <FiEyeOff size={22} color="#a0aec0" /> : <FiEye size={22} color="#a0aec0" />}
          </button>
        </div>

        {errorMsg && <p className="error-text">{errorMsg}</p>}

        <button className={`login-btn ${loading ? 'disabled' : ''}`} onClick={handleLogin} disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <span>Iniciar Sesión</span>
              <FiArrowRight size={22} color="#fff" />
            </>
          )}
        </button>
      </div>

      <p className="footer-text">INEO v2.0 - Sistema de Gestión Hospitalaria</p>
    </div>
  );
};

export default LoginScreen;