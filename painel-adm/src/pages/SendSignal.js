import React, { useState, useEffect } from "react";
import { api } from "../config/api";
import "./css/SendSignal.css";

export default function SendSignal() {
  const [form, setForm] = useState({
    campeonato: "",
    nomeTimes: "",
    tempoPartida: "",
    placar: "",
    acaoSinal: "",
    tipoEvento: "DICA",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsAnimated(true), 100);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpa mensagens ao digitar
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Validação
    if (
      !form.campeonato.trim() ||
      !form.nomeTimes.trim() ||
      !form.tempoPartida.trim() ||
      !form.placar.trim() ||
      !form.acaoSinal.trim() ||
      !form.tipoEvento.trim()
    ) {
      setError("Preencha todos os campos obrigatórios.");
      
      // Animação de erro
      const formElement = e.target;
      formElement.style.animation = "shake 0.5s";
      setTimeout(() => {
        formElement.style.animation = "";
      }, 500);
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/signals", {
        campeonato: form.campeonato,
        nomeTimes: form.nomeTimes,
        tempoPartida: form.tempoPartida,
        placar: form.placar,
        acaoSinal: form.acaoSinal,
        tipoEvento: form.tipoEvento
      });

      setSuccess("Sinal enviado com sucesso!");
      
      // Feedback visual de sucesso
      const formElement = e.target;
      formElement.style.transform = "scale(0.98)";
      setTimeout(() => {
        formElement.style.transform = "scale(1)";
      }, 150);

      // Reset do formulário
      setForm({
        campeonato: "",
        nomeTimes: "",
        tempoPartida: "",
        placar: "",
        acaoSinal: "",
        tipoEvento: "DICA",
      });

      // Remove mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {
      setError(err.message || "Erro ao enviar sinal.");
      
      // Animação de erro
      const formElement = e.target;
      formElement.style.animation = "shake 0.5s";
      setTimeout(() => {
        formElement.style.animation = "";
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case "DICA":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "GOL":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "CARTAO":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case "ALERTA":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case "VIP":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="send-signal-container">
      <div className="send-signal-background">
        <div className="gradient-overlay"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className={`send-signal-card ${isAnimated ? 'animated' : ''}`}>
        <div className="send-signal-header">
          <div className="icon-container">
            <div className="icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <h1 className="send-signal-title">Enviar Sinal</h1>
          <p className="send-signal-subtitle">Configure e envie sinais para os usuários</p>
        </div>
        
        <form onSubmit={handleSubmit} className="send-signal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="campeonato" className="form-label">
                <span className="label-text">Campeonato</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="campeonato"
                  name="campeonato"
                  value={form.campeonato}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ex: Brasileirão Série A"
                  required
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nomeTimes" className="form-label">
                <span className="label-text">Times</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="nomeTimes"
                  name="nomeTimes"
                  value={form.nomeTimes}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ex: Flamengo x Palmeiras"
                  required
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tempoPartida" className="form-label">
                <span className="label-text">Tempo de Partida</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="tempoPartida"
                  name="tempoPartida"
                  value={form.tempoPartida}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ex: 75'"
                  required
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="placar" className="form-label">
                <span className="label-text">Placar</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="placar"
                  name="placar"
                  value={form.placar}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ex: 2x1"
                  required
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h9l3 3 3-3h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="tipoEvento" className="form-label">
              <span className="label-text">Tipo de Evento</span>
            </label>
            <div className="select-wrapper">
              <select
                id="tipoEvento"
                name="tipoEvento"
                value={form.tipoEvento}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="DICA">💡 DICA</option>
                <option value="GOL">⚽ GOL</option>
                <option value="CARTAO">🟨 CARTÃO</option>
                <option value="ALERTA">⚠️ ALERTA</option>
                <option value="VIP">⭐ VIP</option>
              </select>
              <div className="select-icon">
                {getEventTypeIcon(form.tipoEvento)}
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="acaoSinal" className="form-label">
              <span className="label-text">Ação do Sinal</span>
            </label>
            <div className="textarea-wrapper">
              <textarea
                id="acaoSinal"
                name="acaoSinal"
                value={form.acaoSinal}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Ex: Aposta: Over 2.5 gols na partida. Odds: 1.85. Confiança: Alta."
                required
                rows={3}
              />
              <div className="textarea-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{success}</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <span>Enviar Sinal</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polygon points="22,2 15,22 11,13 2,9 22,2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
