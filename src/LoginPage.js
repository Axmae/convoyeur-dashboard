import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // <-- Contexte d'authentification
import ocpLogo from './logo.jpg'; // Logo OCP

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // depuis le contexte

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Le nom d'utilisateur est requis";
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Exemple de vérification basique
        if (formData.username !== 'Admin' || formData.password !== '123456') {
          throw new Error('Identifiants invalides');
        }
        login(); // authentification réussie
        navigate('/chart'); // redirection vers ChartPage
      } catch (error) {
        setErrors({ general: 'Nom d\'utilisateur ou mot de passe incorrect' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="background-image"></div>
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <img src={ocpLogo} alt="Logo OCP" className="ocp-logo" />
          </div>
          <h1>Groupe OCP</h1>
          <p>Se connecter</p>
        </div>

        {errors.general && <div className="error-message">{errors.general}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'input-error' : ''}
              placeholder="Nom d'utilisateur"
              disabled={isLoading}
            />
            {errors.username && <span className="error-icon">!</span>}
            {errors.username && <div className="error-text">{errors.username}</div>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              placeholder="Mot de passe"
              disabled={isLoading}
            />
            {errors.password && <span className="error-icon">!</span>}
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <span className="spinner"></span> : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
