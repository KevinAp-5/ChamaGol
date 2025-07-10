import React, { useEffect, useState } from "react";
import { api } from "../config/api";
import "./css/Terms.css";

export default function Terms() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    version: "",
    content: ""
  });
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/terms");
      setTerms(res.data || []);
    } catch (error) {
      showFeedback("error", "Erro ao carregar termos de uso");
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: "", message: "" }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (feedback.message) setFeedback({ type: "", message: "" });
  };

  const validateForm = () => {
    if (!formData.version.trim()) {
      showFeedback("error", "Versão é obrigatória");
      return false;
    }
    if (!formData.content.trim()) {
      showFeedback("error", "Conteúdo é obrigatório");
      return false;
    }
    if (formData.content.length < 100) {
      showFeedback("error", "Conteúdo deve ter pelo menos 100 caracteres");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.post("/api/terms", formData);
      showFeedback("success", "Termo criado com sucesso!");
      setFormData({ version: "", content: "" });
      fetchTerms();
    } catch (error) {
      showFeedback("error", "Erro ao criar termo. Verifique se a versão já existe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTerms = terms.filter(term =>
    term.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="terms-page">
      <div className="terms-header">
        <div className="header-content">
          <h1 className="page-title">Termos de Uso</h1>
          <p className="page-subtitle">Gerencie as versões dos termos de uso do aplicativo</p>
        </div>
      </div>

      <div className="terms-content">
        {/* Formulário de Criação */}
        <div className="terms-card">
          <div className="card-header">
            <h2 className="card-title">Criar Nova Versão</h2>
            <p className="card-subtitle">Adicione uma nova versão dos termos de uso</p>
          </div>

          <form onSubmit={handleSubmit} className="terms-form">
            <div className="form-group">
              <label htmlFor="version" className="form-label">
                <span className="label-text">Versão</span>
                <span className="label-required">*</span>
              </label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ex: 1.0.0, 2.1.0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">
                <span className="label-text">Conteúdo</span>
                <span className="label-required">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Digite o conteúdo completo dos termos de uso..."
                rows={12}
                required
              />
              <div className="char-counter">
                {formData.content.length} caracteres (mínimo: 100)
              </div>
            </div>

            {feedback.message && (
              <div className={`feedback-message ${feedback.type}`}>
                <div className="feedback-icon">
                  {feedback.type === "success" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
                <span>{feedback.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`submit-button ${isSubmitting ? 'loading' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <span>Criar Termo</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Histórico de Termos */}
        <div className="terms-card">
          <div className="card-header">
            <h2 className="card-title">Histórico de Versões</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar por versão..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <div className="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="terms-history">
            {loading ? (
              <div className="loading-state">
                <div className="spinner large"></div>
                <span>Carregando histórico...</span>
              </div>
            ) : filteredTerms.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>Nenhum termo encontrado</h3>
                <p>Crie o primeiro termo de uso do sistema</p>
              </div>
            ) : (
              <div className="terms-list">
                {filteredTerms.map((term, idx) => (
                  <div key={idx} className="term-item">
                    <div className="term-header">
                      <div className="term-info">
                        <h3 className="term-version">Versão {term.version}</h3>
                        <p className="term-date">
                          Criado em {formatDate(term.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedTerm(selectedTerm?.version === term.version ? null : term)}
                        className="view-button"
                      >
                        {selectedTerm?.version === term.version ? (
                          <>
                            <span>Ocultar</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Ver Detalhes</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {selectedTerm?.version === term.version && (
                      <div className="term-content">
                        <div className="content-header">
                          <h4>Conteúdo do Termo</h4>
                          <span className="content-length">
                            {term.content.length} caracteres
                          </span>
                        </div>
                        <div className="content-text">
                          {term.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}