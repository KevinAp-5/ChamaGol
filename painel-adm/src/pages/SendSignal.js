import React, { useState, useEffect } from "react";
import { Globe, Star, Users, Send, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";

import { api } from "../config/api";

export default function SendSignal() {
  const [form, setForm] = useState({
    content: "",
    people: "ALL",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 100);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async () => {
    setSuccess("");
    setError("");

    // Validação
    if (!form.content.trim()) {
      setError("Por favor, preencha o conteúdo da mensagem.");
      return;
    }

    if (form.content.length > 1000) {
      setError("O conteúdo não pode ter mais de 1000 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/message", {
        content: form.content,
        people: form.people
      });

      setSuccess("Sinal enviado com sucesso! 🚀");

      setForm({
        content: "",
        people: "ALL",
      });

      setTimeout(() => {
        setSuccess("");
      }, 5000);

    } catch (err) {
      setError(err.message || "Erro ao enviar sinal.");
    } finally {
      setLoading(false);
    }
  };

  const characterCount = form.content.length;
  const isOverLimit = characterCount > 1000;

  const getAudienceColor = (audience) => {
    switch (audience) {
      case 'VIP': return '#8E24AA';
      case 'FREE': return '#34C759';
      case 'ALL': return '#E53935';
      default: return '#E53935';
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
              <Send size={24} />
            </div>
          </div>
          <h1 className="send-signal-title">Enviar Sinal</h1>
          <p className="send-signal-subtitle">Configure e envie sinais para os usuários</p>
        </div>
        
        <div className="send-signal-form">
          <div className="form-group full-width">
            <label htmlFor="content" className="form-label">
              <MessageSquare size={18} />
              <span className="label-text">Conteúdo da Mensagem</span>
              <span className="required-indicator">*</span>
            </label>
            <div className="textarea-wrapper">
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                className={`form-textarea ${isOverLimit ? 'over-limit' : ''}`}
                placeholder="Digite sua mensagem aqui... Emojis são suportados! 🎉⚽🔥

Exemplo:
🔥 Atenção! Jogo entre Flamengo x Palmeiras está muito quente! Placar 2x1 aos 35' do segundo tempo. Grande oportunidade! ⚽"
                rows={8}
              />
              <div className={`character-count ${isOverLimit ? 'over-limit' : ''}`}>
                <span className="count-text">{characterCount} / 1000 caracteres</span>
                {isOverLimit && (
                  <span className="warning-text">
                    <AlertCircle size={14} />
                    Limite excedido!
                  </span>
                )}
              </div>
            </div>
            <div className="help-text">
              💡 Dica: Use emojis para tornar sua mensagem mais atrativa e clara
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              <Users size={18} />
              <span className="label-text">Público-Alvo</span>
              <span className="required-indicator">*</span>
            </label>
            <div className="audience-options">
              <label 
                className={`audience-option ${form.people === 'ALL' ? 'selected' : ''}`}
                style={form.people === 'ALL' ? {
                  borderColor: getAudienceColor('ALL'),
                  background: 'rgba(229, 57, 53, 0.05)'
                } : {}}
              >
                <input
                  type="radio"
                  name="people"
                  value="ALL"
                  checked={form.people === 'ALL'}
                  onChange={handleChange}
                  style={{ accentColor: getAudienceColor('ALL') }}
                />
                <div className="option-icon" style={{ background: getAudienceColor('ALL') }}>
                  <Globe size={20} />
                </div>
                <div className="option-content">
                  <strong>Todos</strong>
                  <span>Enviar para todos os usuários</span>
                </div>
              </label>

              <label 
                className={`audience-option ${form.people === 'VIP' ? 'selected' : ''}`}
                style={form.people === 'VIP' ? {
                  borderColor: getAudienceColor('VIP'),
                  background: 'rgba(142, 36, 170, 0.05)'
                } : {}}
              >
                <input
                  type="radio"
                  name="people"
                  value="VIP"
                  checked={form.people === 'VIP'}
                  onChange={handleChange}
                  style={{ accentColor: getAudienceColor('VIP') }}
                />
                <div className="option-icon" style={{ background: getAudienceColor('VIP') }}>
                  <Star size={20} />
                </div>
                <div className="option-content">
                  <strong>Apenas VIP</strong>
                  <span>Somente usuários premium</span>
                </div>
              </label>

              <label 
                className={`audience-option ${form.people === 'FREE' ? 'selected' : ''}`}
                style={form.people === 'FREE' ? {
                  borderColor: getAudienceColor('FREE'),
                  background: 'rgba(52, 199, 89, 0.05)'
                } : {}}
              >
                <input
                  type="radio"
                  name="people"
                  value="FREE"
                  checked={form.people === 'FREE'}
                  onChange={handleChange}
                  style={{ accentColor: getAudienceColor('FREE') }}
                />
                <div className="option-icon" style={{ background: getAudienceColor('FREE') }}>
                  <Users size={20} />
                </div>
                <div className="option-content">
                  <strong>Apenas Free</strong>
                  <span>Somente usuários gratuitos</span>
                </div>
              </label>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={loading || !form.content.trim() || isOverLimit}
            className={`submit-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Enviando sinal...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Enviar Sinal</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .send-signal-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          position: relative;
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .send-signal-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 30%, #B71C1C 100%);
        }

        .gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(229, 57, 53, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 87, 34, 0.15) 0%, transparent 50%);
        }

        .floating-shapes {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: float 20s infinite ease-in-out;
        }

        .shape-1 {
          width: 300px;
          height: 300px;
          background: #E53935;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 200px;
          height: 200px;
          background: #FF5722;
          top: 60%;
          right: 15%;
          animation-delay: 5s;
        }

        .shape-3 {
          width: 150px;
          height: 150px;
          background: #ffffff;
          bottom: 20%;
          left: 50%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(50px, -50px) rotate(90deg); }
          50% { transform: translate(0, -100px) rotate(180deg); }
          75% { transform: translate(-50px, -50px) rotate(270deg); }
        }

        .send-signal-card {
          position: relative;
          z-index: 1;
          max-width: 800px;
          width: 100%;
          background: white;
          border-radius: 32px;
          padding: 48px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .send-signal-card.animated {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .send-signal-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .icon-container {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #E53935, #FF5722);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 25px rgba(229, 57, 53, 0.3);
        }

        .send-signal-title {
          font-size: 36px;
          font-weight: 800;
          color: #000000;
          margin: 0 0 12px 0;
          letter-spacing: -1px;
        }

        .send-signal-subtitle {
          font-size: 18px;
          color: #757575;
          margin: 0;
          font-weight: 500;
        }

        .send-signal-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-group.full-width {
          width: 100%;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          color: #1f2937;
          font-size: 16px;
        }

        .label-text {
          flex: 1;
        }

        .required-indicator {
          color: #E53935;
          font-weight: 700;
        }

        .textarea-wrapper {
          position: relative;
        }

        .form-textarea {
          width: 100%;
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          font-family: inherit;
          font-size: 16px;
          resize: vertical;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          line-height: 1.6;
          color: #1f2937;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #E53935;
          box-shadow: 0 4px 20px rgba(229, 57, 53, 0.15);
        }

        .form-textarea.over-limit {
          border-color: #E53935;
          background: #fef2f2;
        }

        .character-count {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding: 0 4px;
        }

        .count-text {
          font-size: 14px;
          color: #6b7280;
          font-weight: 600;
        }

        .character-count.over-limit .count-text {
          color: #E53935;
          font-weight: 700;
        }

        .warning-text {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #E53935;
          font-weight: 700;
        }

        .help-text {
          font-size: 14px;
          color: #6b7280;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 12px;
          border-left: 4px solid #E53935;
          margin-top: -8px;
        }

        .audience-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .audience-option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border: 3px solid #e5e7eb;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
        }

        .audience-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .audience-option.selected {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }

        .audience-option input[type="radio"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .option-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .option-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .option-content strong {
          font-size: 16px;
          color: #1f2937;
          font-weight: 700;
        }

        .option-content span {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .error-message,
        .success-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 24px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 15px;
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .error-message {
          background: #fef2f2;
          color: #991b1b;
          border: 2px solid #E53935;
        }

        .success-message {
          background: #d1fae5;
          color: #065f46;
          border: 2px solid #34C759;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .submit-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 22px 32px;
          background: linear-gradient(135deg, #E53935, #FF5722);
          color: white;
          border: none;
          border-radius: 18px;
          font-weight: 700;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 25px rgba(229, 57, 53, 0.3);
          margin-top: 16px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(229, 57, 53, 0.4);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(-1px) scale(0.98);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .send-signal-card {
            padding: 32px 24px;
            border-radius: 24px;
          }

          .send-signal-title {
            font-size: 28px;
          }

          .send-signal-subtitle {
            font-size: 16px;
          }

          .icon {
            width: 64px;
            height: 64px;
          }

          .audience-options {
            grid-template-columns: 1fr;
          }

          .send-signal-form {
            gap: 24px;
          }
        }

        @media (max-width: 480px) {
          .send-signal-container {
            padding: 24px 16px;
          }

          .send-signal-card {
            padding: 24px 20px;
          }

          .send-signal-title {
            font-size: 24px;
          }

          .submit-button {
            padding: 18px 24px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}